# Deployment & NAS notes

## NAS details
- Model: Synology DS214, DSM 7.0+
- Python installed via Package Center (Python 3.9)
- Tool path on NAS: `/volume1/tools/syn-tool`
- Run with `sudo` — required for share scanning permissions
- DSM HTTP API runs on port **3333** (not the often-documented 5000)

## Docker (primary, DSM 7.2+)

Image is built via GitHub Actions on every push to main and pushed to `ghcr.io/applejuicelolmc/syn-tool:latest`.
The NAS pulls the pre-built image — no building on the NAS (Synology kernel doesn't support seccomp, which breaks Docker builds).

### docker-compose.yml key settings
- `image: ghcr.io/applejuicelolmc/syn-tool:latest`
- `privileged: true` + `pid: host` — required for `nsenter` (btrfs qgroup from Docker)
- `/volume1:/volume1:ro` — NAS shares mounted read-only

### Container Manager update flow
1. Stop project
2. Delete old image (`ghcr.io/applejuicelolmc/syn-tool`)
3. Start project — Container Manager pulls fresh image

## Environment variables

All credentials and key settings can be injected via env vars — no config.json editing needed.
Env vars take priority over config.json on every request. Passwords are hashed/encrypted
once (sentinel-based) so there's no PBKDF2 overhead on subsequent requests.

| Variable | Description |
|---|---|
| `SYNTOOL_AUTH_USERNAME` | App login username |
| `SYNTOOL_AUTH_PASSWORD` | App login password (auto-hashed PBKDF2) |
| `SYNTOOL_AUTH_ENABLED` | `true`/`false`/`1`/`0` |
| `SYNTOOL_DSM_HOST` | DSM hostname or IP (default: localhost) |
| `SYNTOOL_DSM_PORT` | DSM HTTP API port (default: 3333) |
| `SYNTOOL_DSM_USER` | DSM username for Storage Analyzer |
| `SYNTOOL_DSM_PASSWORD` | DSM password (auto-encrypted with app secret key) |
| `SYNTOOL_MAILBOX_GB` | GB included per mailbox in billing formula |

### Docker secrets (passwords only)

Option 1 — `_FILE` env var pointing to a secret file:
```yaml
environment:
  - SYNTOOL_AUTH_PASSWORD_FILE=/run/secrets/auth_password
  - SYNTOOL_DSM_PASSWORD_FILE=/run/secrets/dsm_password
secrets:
  - auth_password
  - dsm_password

secrets:
  auth_password:
    file: ./secrets/auth_password.txt
  dsm_password:
    file: ./secrets/dsm_password.txt
```

Option 2 — Drop files at `/run/secrets/auth_password` and `/run/secrets/dsm_password`
(Docker Swarm default path) — auto-discovered without extra config.

### Example docker-compose with credentials
```yaml
environment:
  - PORT=9000
  - HOST=0.0.0.0
  - DATA_DIR=/app/data
  - SYNTOOL_AUTH_USERNAME=admin
  - SYNTOOL_AUTH_PASSWORD=changeme
  - SYNTOOL_DSM_HOST=localhost
  - SYNTOOL_DSM_PORT=3333
  - SYNTOOL_DSM_USER=MyDSMUser
  - SYNTOOL_DSM_PASSWORD=MyDSMPass
```

## Standalone Python (fallback, DSM 7.0+)

```sh
sudo git clone https://github.com/Applejuicelolmc/syn-tool.git /volume1/tools/syn-tool
cd /volume1/tools/syn-tool
sudo ./install.sh
sudo ./start.sh
```

Update: `sudo git pull && sudo ./start.sh`

Env vars work identically for standalone — set them in the shell or prefix the start command:
```sh
SYNTOOL_DSM_PASSWORD=secret sudo ./start.sh
```

## DSM Storage Analyzer integration

The tool fetches accurate share sizes from DSM Storage Analyzer via its HTTP API.
This bypasses POSIX ACL restrictions that prevent `du` from reading Active Backup shares
(GsuiteBackup shows 186 GB with `du` but 534 GB in Storage Analyzer).

### Setup
1. Run Storage Analyzer manually in DSM for each share you want accurate sizes for
2. Set DSM credentials in Settings (or via env vars) — the DSM account needs permission
   to call `SYNO.Core.Report`
3. On each scan the tool authenticates, fetches existing report HTMLs, and parses sizes

### Storage Analyzer report path
`/volume{N}/{AnalyzerShare}/synoreport/{Report Name}/{YYYY-MM-DD_HH-MM-SS}/`

Files in each report directory are **Berkeley DB B-tree format** (not standard SQLite).
The report HTML (`report.html`) contains the share size as a JS array:
`[ 'ShareName', 'volume_1', 'size_bytes_string', 0, 0, 0 ]`

The tool fetches these HTML files via `http://localhost:3333/dar/...` (authenticated).

### Known report→share mappings (this NAS)
| Report name | Share |
|---|---|
| GSuite Storage Report | GsuiteBackup |
| O365 Storage Report | Office365BackUp |
| M365BUChickenJohn | M365-Bu-ChickenJohn |
| M365BUFredasbest | M365-BU-Fredasbest |
| M365BUFactis | M365-BU-Fact-is.be |
| M365BUHubtex | M365-BU-Hubtex |
| M365BUAddmodum | (no report — falls back to du/btrfs) |

## Dev workflow

Push to GitHub → GitHub Actions builds Docker image (~1 min) → pull on NAS.

```sh
git add -A
git commit -m "description"
git push
```

## Known NAS / BusyBox quirks

### `hostname -I` not available
BusyBox doesn't support it. `start.sh` uses:
```sh
NAS_IP=$(ip route get 1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1)
```

### Python 3.9 paths
Synology Package Center installs at `/var/packages/Python3.9/target/bin/python3.9`.
`install.sh` and `start.sh` check: `python3.9`, `python3`, `python`, then the Synology-specific path.

### Git conflicts on NAS
If `git pull` fails with local changes: `sudo git checkout <file> && sudo git pull`

### `du` on Active Backup shares
`du --apparent-size` on GsuiteBackup/Office365BackUp returns ~186 GB due to ACL restrictions —
even as root in a privileged container. The correct size (534 GB for GsuiteBackup) only comes
from Storage Analyzer. I/O errors on `#SynoVersions/GMT-...-DEL` files are expected and harmless;
`du` still outputs a valid total even with non-zero exit code.

## Running locally for development
```sh
python3 app.py  # port 9000
```
