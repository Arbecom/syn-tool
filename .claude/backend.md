# Backend — app.py

## Data paths (all under DATA_DIR, default `./data`)

```text
data/
  current.json          — active Excel data { headers, rows, _meta }
  config.json           — user settings (auth, DSM credentials, share paths, etc.)
  mappings.json         — customer→share mappings (persisted across uploads)
  apparent_sizes.json   — cache of last-known share sizes (analyzer + btrfs results)
  shares_cache.json     — last full scan result (shares + volumes)
  .secret_key           — Flask session secret key + DSM credential encryption key
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
    "mailbox_gb":       10,
    "auth_enabled":     True,
    "auth_username":    "admin",
    "auth_password":    "admin",
    "dsm_host":         "localhost",
    "dsm_port":         3333,
    "dsm_user":         "",
    "dsm_password":     "",   # stored encrypted, never plaintext
}
```

Internal sentinel keys written by env-var password handling (never shown in API responses):

- `_env_auth_pw_sentinel` — sha256 of env-var auth password, used to detect changes
- `_env_dsm_pw_sentinel`  — sha256 of env-var DSM password, used to detect changes

## Auth

Session-based auth via Flask sessions. Secret key auto-generated and stored in `data/.secret_key`.
Sessions are permanent (30 days).

`@app.before_request` blocks all `/api/*` routes (except `/api/auth/*`) with 401 if not authenticated.

### Password storage
**App login password:** stored as `pbkdf2:sha256:50000:<salt_hex>:<hash_hex>` — one-way, unrecoverable.
Legacy plaintext passwords auto-upgrade to PBKDF2 on first successful login.

**DSM password:** must be recoverable (sent to DSM HTTP API), so stored as `enc:<base64(iv + xor(plaintext, pbkdf2(secret_key, iv, 1000)))>`. Requires both `config.json` and `.secret_key` to recover. Decrypted only when making DSM API calls.

`GET /api/settings` strips both `auth_password` and `dsm_password` from the response.
`dsm_password_set` (bool) is included in the response instead.

### Auth routes
- `GET /api/auth/status` — `{ authenticated, auth_enabled }` — always public
- `POST /api/auth/login` — body: `{ username, password }` → verifies hash, auto-upgrades legacy plaintext, sets session
- `POST /api/auth/logout` — clears session

### Credential helpers
- `hash_password(password)` → pbkdf2 string
- `verify_password(password, stored)` → bool (handles legacy plaintext)
- `_encrypt_credential(plaintext)` → `enc:<base64>` (uses .secret_key + random IV)
- `_decrypt_credential(stored)` → plaintext (returns legacy plaintext transparently)
- `_read_secret(env_name)` → reads from `{env_name}_FILE` path, then direct env var, then `/run/secrets/<name>`
- `_apply_env_overrides(cfg)` → applies all `SYNTOOL_*` env vars over config dict; handles password sentinel logic to avoid re-hashing on every request

## Environment variables

All settings can be set via env vars (take priority over config.json):

| Variable | Config key | Notes |
|---|---|---|
| `SYNTOOL_AUTH_USERNAME` | auth_username | |
| `SYNTOOL_AUTH_PASSWORD` | auth_password | auto-hashed PBKDF2, unrecoverable |
| `SYNTOOL_AUTH_ENABLED` | auth_enabled | `true`/`false`/`1`/`0` |
| `SYNTOOL_DSM_HOST` | dsm_host | |
| `SYNTOOL_DSM_PORT` | dsm_port | int |
| `SYNTOOL_DSM_USER` | dsm_user | |
| `SYNTOOL_DSM_PASSWORD` | dsm_password | auto-encrypted with app secret key |
| `SYNTOOL_MAILBOX_GB` | mailbox_gb | float |

**Docker secrets:** for passwords, set `SYNTOOL_AUTH_PASSWORD_FILE=/run/secrets/auth_password`
(or `SYNTOOL_DSM_PASSWORD_FILE=...`), or drop files at `/run/secrets/auth_password` and
`/run/secrets/dsm_password` — auto-discovered without extra config.

Sentinel mechanism: passwords from env vars are hashed/encrypted once per change and written
to config.json. Subsequent requests only do a fast sha256 comparison, not full PBKDF2.

## API Routes

### `GET /api/shares/stream`
SSE endpoint. Only one scan runs at a time (`_scan_lock`).

**Pre-scan:** Calls `_get_dsm_analyzer_sizes(cfg)` + `_btrfs_sizes_for_paths()` if DSM credentials are configured. Results used immediately — no Phase 2.

**Share emit:** One `share` event per share, all `pending: false`. Size priority:
1. Storage Analyzer size (accurate, bypasses ACLs) — `is_from_cache: false`, `analyzer_date` set
2. `apparent_sizes.json` cache (last known value) — `is_from_cache: true`, `analyzer_date` empty
3. btrfs qgroup estimate (fast, may undercount Active Backup shares) — `is_from_cache: false`, `analyzer_date` empty

Followed immediately by `done` then `all_done` — scan completes in a single pass.

Events: `discovered`, `share`, `done`, `all_done`, `busy`, `error`. (`share_update` never emitted.)

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

### `GET /api/settings`
Returns full config minus `auth_password` and `dsm_password`. Includes `dsm_password_set: bool`.

### `POST /api/settings`
Accepted fields: `share_paths`, `exclude_shares`, `upload_retention`, `edit_retention`,
`mailbox_gb`, `auth_enabled`, `auth_username`, `auth_password`,
`dsm_host`, `dsm_port`, `dsm_user`, `dsm_password`.
`dsm_password` is encrypted before storage. `auth_password` is PBKDF2-hashed.

### `POST /api/settings/test_dsm`
Body: `{ dsm_host, dsm_port, dsm_user, dsm_password }` or `{ ..., use_stored_password: true }`.
Authenticates to DSM and calls `SYNO.Core.Report&method=list`.
Returns `{ success, report_count }` or `{ error }`.

## Share size measurement

### Priority order
1. **DSM Storage Analyzer** (most accurate — uses DSM kernel privileges, bypasses POSIX ACLs)
2. **apparent_sizes.json cache** (last known value from a previous successful scan)
3. **btrfs qgroup** (fast estimate; unreliable for Active Backup shares where excl=0)

`du --apparent-size` has been removed — all shares emit immediately with no Phase 2.

### `_get_dsm_analyzer_sizes(cfg)`
Authenticates to DSM HTTP API (`http://{dsm_host}:{dsm_port}/webapi/`).
1. `POST /webapi/entry.cgi` with `SYNO.API.Auth&method=login&format=cookie` → session cookie
2. `POST /webapi/entry.cgi` with `SYNO.Core.Report&version=1&method=list` → all Storage Analyzer reports
3. For each report with `status=success`: fetches HTML at `link` field (`/dar/...`)
4. Parses `['ShareName', 'volume_N', 'size_bytes', ...]` arrays with regex
5. Returns `(sizes, dates)` — `{share_name: size_bytes}` largest per share, `{share_name: 'YYYY-MM-DD'}` from path

DSM HTTP API port on this NAS is **3333** (not 5000). Discovery via:
`curl http://localhost:3333/webapi/query.cgi?api=SYNO.API.Info&version=1&method=query&query=all`

### `_btrfs_sizes_for_paths(paths, base)`
Returns `(sizes, _)` tuple (second element unused).
1. Runs `btrfs subvolume show PATH` in parallel for each share → gets subvolume IDs
2. Tries direct `btrfs qgroup show --raw base`, falls back to `nsenter --target 1 --mount --`
   (nsenter enters host mount namespace from Docker — PID 1 via `pid: host`)
3. Parses level-0 (per-subvolume) and level-1 (aggregate) qgroup entries

**Known limitation:** Active Backup shares (GsuiteBackup, Office365BackUp, M365-BU-*) have
`excl=0` in btrfs (all data shared via reflinks), so qgroup `rfer` severely underestimates.
Storage Analyzer is the only accurate source for these shares.

### Scan logic (api_shares_stream)
1. Call `_get_dsm_analyzer_sizes(cfg)` and `_btrfs_sizes_for_paths()` — no I/O to share directories
2. Emit all shares immediately, all `pending: false`:
   - Analyzer size → accurate, saved to apparent_cache
   - Otherwise → apparent_cache value, then btrfs qgroup as last resort
3. Emit `done` then `all_done` — stream closes, scan complete in one pass, no Phase 2

## Key functions

### `detect_key_col(headers)`
Prefers customer name over contract number.

### `compute_mapping_diff(headers, rows, mappings)`
Matches rows to stored mappings by `display_name.lower()`. Returns `{ key_col, applied, new, removed, changed, has_diff }`.

### `build_excel(data, cfg)`
Reconstructs .xlsx. Re-inserts billing formula: `=G{ri}-({mailbox_gb}*E{ri})`.

### Retention
`_apply_retention(directory, pattern, keep)` — sorts by mtime, deletes files beyond `keep`.
