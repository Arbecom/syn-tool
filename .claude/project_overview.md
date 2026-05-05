# Synology Storage Tool — Project Overview

Web tool for reading NAS share sizes and managing customer billing Excel on Synology DS214 (DSM 7.0+).

**Goal:** Scan NAS shares (sizes only, no file reading), show a web dashboard, manage customer billing Excel (upload/edit/export), retain version history with rollback, persist customer→share mappings across Excel uploads. Session-based login protects all access.

**Stack:** Python 3.9 + Flask + openpyxl. Single `static/index.html` frontend — no build step, no npm, no framework.

**Why Python 3.9:** Available in Synology Package Center on DS214 / DSM 7.0 which doesn't support Docker. Docker added for DSM 7.2+.

**Docker CI/CD:** GitHub Actions builds the image on every push to `main` and pushes to `ghcr.io/applejuicelolmc/syn-tool:latest`. The NAS pulls the pre-built image — no building on the NAS (Synology kernel doesn't support seccomp, which breaks Docker builds).

## Key files
- `app.py` — Flask backend, all API routes
- `static/html/index.html` — full SPA, Dashboard / Excel / History / Settings tabs + login overlay
- `static/javascript/index.js` — all frontend JS (state, i18n EN/NL, all functions)
- `static/css/` — stylesheets
- `requirements.txt` — `flask>=2.3,<3.0` and `openpyxl>=3.1,<4.0`
- `Dockerfile` + `docker-compose.yml` — for DSM 7.2+ (image pulled from ghcr.io)
- `.github/workflows/docker.yml` — builds and pushes Docker image on push to main
- `install.sh` + `start.sh` — for standalone DSM 7.0 deployment
- `data/` — runtime data (git-ignored): `current.json`, `config.json`, `mappings.json`,
  `apparent_sizes.json`, `shares_cache.json`, `uploads/`, `edits/`, `mappings_history/`, `.secret_key`

## Python 3.9 constraint
**Always use `from typing import Optional` and `Optional[str]` — NOT `str | None` (Python 3.10+ only).**

## Excel billing sheet (Dutch columns)
`Volgnummer opslag | Contractnummer | Klantnaam | Server | Mailboxen | Licenties | Gebruikte opslag | Te factureren opslag`

Formula: `Te factureren = Gebruikte opslag − (mailbox_gb × Mailboxen)` (default: 10 GB free per mailbox)

`Gebruikte opslag` is auto-populated from NAS share sizes via the NAS Koppeling dropdown.

## Share size accuracy

Three sources, in priority order:
1. **DSM Storage Analyzer** — accurate for Active Backup shares (bypasses ACLs); fetched via DSM HTTP API at `localhost:3333`
2. **du --apparent-size** — accurate for standard shares; partial on Active Backup due to ACL restrictions
3. **btrfs qgroup** — fast estimate; unreliable for Active Backup shares (excl=0)

The tool caches last-known sizes in `apparent_sizes.json` for offline fallback.

## Security model

- **App login password:** PBKDF2-hashed (sha256, 50k iterations), unrecoverable from config.json
- **DSM password:** encrypted with app secret key (AES-like XOR + PBKDF2 key derivation + random IV); requires both `config.json` AND `data/.secret_key` to recover
- All credentials overridable via `SYNTOOL_*` environment variables or Docker secrets files

## For full detail see:
- `.claude/backend.md` — all API routes, config defaults, data paths, key functions, env vars
- `.claude/frontend.md` — JS state object, i18n, all functions, column sort/resize, mapping diff modal
- `.claude/deployment.md` — NAS model/paths, git workflow, BusyBox quirks, DSM integration, env vars
