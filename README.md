# Synology Storage Tool

Web dashboard for scanning NAS share sizes and managing customer billing Excel files.

Default login: **admin / admin** — change in Settings after first login.

---

## Option A — Docker / Container Manager (DSM 7.2+)

### 1. Install required packages

Open **Package Center** and install:
- **Git Server**
- **Container Manager**

### 2. Enable SSH

**Control Panel → Terminal & SNMP → Terminal** → enable SSH service.

Connect via SSH:
```sh
ssh <your-user>@<NAS-IP>
```

### 3. Clone the repo

```sh
sudo git clone https://github.com/Applejuicelolmc/syn-tool.git /volume1/tools/syn-tool
```

### 4. Set up the project in Container Manager

1. Open **Container Manager → Project → Create**
2. Set the path to `/volume1/tools/syn-tool`
3. Container Manager detects `docker-compose.yml` automatically — click through
4. It pulls the image and starts the container

Open `http://<NAS-IP>:9000`

---

### Updating

1. **Project → syn-tool → Action → Stop**
2. **Container → select `syn-tool` → Delete**
3. **Image → select `ghcr.io/applejuicelolmc/syn-tool` → Delete**
4. SSH into the NAS and pull the latest `docker-compose.yml`:
   ```sh
   cd /volume1/tools/syn-tool && sudo git pull
   ```
5. **Project → syn-tool → Action → Start** — pulls the new image and starts

---

## Option B — Standalone Python (DSM 7.0+)

### 1. Install required packages

Open **Package Center** and install:
- **Git Server**
- **Python 3.9**

### 2. Enable SSH

**Control Panel → Terminal & SNMP → Terminal** → enable SSH service.

Connect via SSH:
```sh
ssh <your-user>@<NAS-IP>
```

### 3. Clone and install

```sh
sudo git clone https://github.com/Applejuicelolmc/syn-tool.git /volume1/tools/syn-tool
cd /volume1/tools/syn-tool
sudo ./install.sh
sudo ./start.sh
```

Open `http://<NAS-IP>:9000`

---

### Updating

```sh
cd /volume1/tools/syn-tool
sudo git pull
sudo ./start.sh
```

---

## DSM Storage Analyzer integration (accurate share sizes)

Active Backup shares (GsuiteBackup, Office365BackUp, M365-BU-*) have ACL restrictions that
prevent `du` from reading their full contents — even as root. DSM's Storage Analyzer runs with
internal kernel privileges that bypass these restrictions and reports the correct sizes.

The tool integrates with Storage Analyzer automatically:
1. Run Storage Analyzer in DSM for each share you want sized accurately (one-time setup)
2. Enter your DSM credentials in **Settings → DSM Storage Analyzer**
3. On every scan the tool fetches the latest report data — no manual re-running needed

If no Storage Analyzer report exists for a share, the tool falls back to `du`/`btrfs`.

---

## Environment variables / Docker secrets

All credentials can be injected without touching the UI — useful for Docker deployments
or automated setups.

| Variable | Description |
|---|---|
| `SYNTOOL_AUTH_USERNAME` | App login username |
| `SYNTOOL_AUTH_PASSWORD` | App login password (stored as PBKDF2 hash) |
| `SYNTOOL_AUTH_ENABLED` | `true` / `false` |
| `SYNTOOL_DSM_HOST` | DSM hostname or IP (default: `localhost`) |
| `SYNTOOL_DSM_PORT` | DSM HTTP API port (default: `3333`) |
| `SYNTOOL_DSM_USER` | DSM username |
| `SYNTOOL_DSM_PASSWORD` | DSM password (stored encrypted) |
| `SYNTOOL_MAILBOX_GB` | GB included free per mailbox in billing formula |

### Docker secrets (recommended for passwords)

**Option 1** — `_FILE` variant pointing to a Docker secret:
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

**Option 2** — Drop plain-text files at `/run/secrets/auth_password` and
`/run/secrets/dsm_password` inside the container — auto-discovered.

### Example docker-compose environment block
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

Passwords set via env vars are hashed/encrypted once on first use and written to `config.json`.
UI-saved settings remain as fallback when env vars are absent.
