# Deployment & NAS notes

## NAS details
- Model: Synology DS214, DSM 7.0+
- Python installed via Package Center (Python 3.9)
- Tool path on NAS: `/volume1/tools/syn-tool`
- Run with `sudo` — required for share scanning permissions

## Docker (primary, DSM 7.2+)

Image is built via GitHub Actions on every push to main and pushed to `ghcr.io/applejuicelolmc/syn-tool:latest`.
The NAS pulls the pre-built image — no building on the NAS (Synology kernel doesn't support seccomp, which breaks Docker builds).

### docker-compose.yml key settings
- `image: ghcr.io/applejuicelolmc/syn-tool:latest`
- `/volume1:/volume1:ro` — NAS shares mounted read-only

Share sizes use `du --apparent-size` (logical file sizes, matches DSM File Station). No btrfs commands, no `privileged` or `pid: host` needed.

### Container Manager update flow
1. Stop project
2. Delete old image (`ghcr.io/applejuicelolmc/syn-tool`)
3. Start project — Container Manager pulls fresh image

## Standalone Python (fallback, DSM 7.0+)

```sh
sudo git clone https://github.com/Applejuicelolmc/syn-tool.git /volume1/tools/syn-tool
cd /volume1/tools/syn-tool
sudo ./install.sh
sudo ./start.sh
```

Update: `sudo git pull && sudo ./start.sh`

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

## Running locally for development
```sh
python3 app.py  # port 9000
```
