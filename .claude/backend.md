# Backend — app.py

## Data paths (all under DATA_DIR, default `./data`)
```
data/
  current.json          — active Excel data { headers, rows, _meta }
  config.json           — user settings (includes auth credentials)
  mappings.json         — customer→share mappings (persisted across uploads)
  .secret_key           — Flask session secret key (auto-generated on first run)
  uploads/              — raw uploaded .xlsx/.xls files
  edits/                — JSON snapshots of current.json taken before each save
  mappings_history/     — JSON snapshots of mappings.json taken before each change
```

## DEFAULT_CONFIG
```python
DEFAULT_CONFIG = {
    "share_paths":    ["/volume1"],
    "exclude_shares": ["@eaDir", "@sharebin", "#recycle", "@tmp", "homes"],
    "upload_retention": 10,
    "edit_retention":   10,
    "mailbox_gb":       10,   # GB free per mailbox in billing formula
    "auth_enabled":     True,
    "auth_username":    "admin",
    "auth_password":    "admin",
}
```

## Auth

Session-based auth via Flask sessions. Secret key auto-generated and stored in `data/.secret_key`.
Sessions are permanent (30 days).

`@app.before_request` blocks all `/api/*` routes (except `/api/auth/*`) with 401 if not authenticated.

### Password storage
Passwords stored as `pbkdf2:sha256:50000:<salt_hex>:<hash_hex>` using `hashlib.pbkdf2_hmac` (stdlib).
Legacy plaintext passwords (default `"admin"`) auto-upgrade to a hash on first successful login.
`GET /api/settings` and `POST /api/settings` response never include `auth_password`.

### Auth routes
- `GET /api/auth/status` — `{ authenticated, auth_enabled }` — always public
- `POST /api/auth/login` — body: `{ username, password }` → verifies hash, auto-upgrades legacy plaintext, sets session
- `POST /api/auth/logout` — clears session

## API Routes

### `GET /api/shares`
Returns `{ shares: [...], volumes: {...} }`.
Scans each path in `share_paths`; skips names in `exclude_shares` and names starting with `@`/`#`.
Each share: `{ name, path, base, size_bytes, size_gb, size_human }`.
Volumes keyed by base path: `{ total_bytes, free_bytes, used_bytes, total_human, free_human }`.

### `GET /api/shares/stream`
SSE endpoint. Events: `discovered` (all share names upfront), `share` (one per share as scanned), `busy`, `done`, `error`.

### `GET /api/shares/cached`
Returns last scan result from `shares_cache.json`.

### `GET /api/excel/current`
Returns `current.json` or empty `{ headers:[], rows:[], _meta:{} }`.

### `POST /api/excel/upload`
Multipart `file` field (.xlsx or .xls). Saves raw file to `uploads/`, parses, applies stored mappings, writes `current.json`.
Returns `{ success, data, mapping_diff }` — `mapping_diff.has_diff` triggers diff modal in frontend.

### `POST /api/excel/save`
Body: `{ headers, rows, _meta, ... }`. Snapshots current.json to edits/ first, then overwrites.

### `GET /api/excel/export`
Builds .xlsx via `build_excel()`, returns as download. Re-inserts billing formula.
Filename: `opslag_YYYYMMDD_HHMMSS.xlsx`

### `GET /api/history`
Returns `{ uploads:[...], edits:[...] }` sorted by mtime descending.

### `POST /api/history/restore/upload/<id>` / `POST /api/history/restore/edit/<id>`
Restores from upload or edit snapshot.

### `GET /api/mappings` / `POST /api/mappings/save`
GET returns `mappings.json`. POST body: `{ key_col, updates, remove }`.

### `GET /api/mappings/history` / `POST /api/mappings/restore/<snap_id>`
Mappings version history and restore.

### `GET /api/settings` / `POST /api/settings`
GET returns full config. POST accepted fields: `share_paths`, `exclude_shares`, `upload_retention`, `edit_retention`, `mailbox_gb`, `auth_enabled`, `auth_username`, `auth_password`.

## Share size measurement

### `_btrfs_sizes_for_paths(paths, base)`
Returns `(sizes, du_needed)` tuple.
1. Runs `btrfs subvolume show PATH` in parallel for each share → gets subvolume IDs
2. Runs `nsenter --target 1 --mount -- btrfs qgroup show --raw base` (enters host mount namespace so quota data is accessible from Docker)
3. Parses level-0 (per-subvolume) and level-1 (aggregate including nested) qgroup entries
4. `du_needed` = paths where `level-1 > level-0` — these have nested subvolumes causing btrfs to undercount vs File Station apparent size (e.g. GsuiteBackup, ActiveBackupforBusiness)

**Why nsenter:** Docker bind-mounted `/volume1` sees "quotas not enabled" from `btrfs qgroup show`. nsenter enters the host's mount namespace (PID 1 via `pid: host`) where quotas ARE enabled.

### `_du_size(path, apparent=False)`
`apparent=True` uses `du --apparent-size --bytes -s` (logical file sizes = File Station). Used automatically for shares in `du_needed`. Falls back to `du -sb` for BusyBox. `apparent=False` uses `du -sk` (physical blocks, fallback for non-btrfs shares).

### Scan logic
- Shares **not** in `du_needed`: instant btrfs qgroup result
- Shares in `du_needed` (backup shares with snapshots): `du --apparent-size` run via semaphore — slower but matches File Station
- Shares not found by btrfs at all: `du -sk` fallback

## Key functions

### `detect_key_col(headers)`
Prefers customer name over contract number.

### `compute_mapping_diff(headers, rows, mappings)`
Matches rows to stored mappings by `display_name.lower()`. Returns `{ key_col, applied, new, removed, changed, has_diff }`.

### `build_excel(data, cfg)`
Reconstructs .xlsx. Re-inserts billing formula: `=G{ri}-({mailbox_gb}*E{ri})`.

### Retention
`_apply_retention(directory, pattern, keep)` — sorts by mtime, deletes files beyond `keep`.
