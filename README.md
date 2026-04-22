# Synology Storage Tool

Web dashboard for scanning NAS share sizes and managing customer billing Excel files.

---

## Option A — Standalone (DSM 7.0+, Python 3.9)

**1. Install Python 3.9** via Synology Package Center.

**2. SSH into the NAS, clone the repo and run the installer:**
```sh
git clone https://github.com/Applejuicelolmc/synology-tool.git /volume1/tools/syn-tool
cd /volume1/tools/syn-tool
sudo ./install.sh
```

**3. Start:**
```sh
sudo ./start.sh
```

Open `http://<NAS-IP>:8080` in your browser.

---

## Option B — Docker (DSM 7.2+)

```sh
git clone https://github.com/Applejuicelolmc/synology-tool.git /volume1/tools/syn-tool
cd /volume1/tools/syn-tool
sudo docker-compose up -d
```

Open `http://<NAS-IP>:8080` in your browser.

---

## Updating

```sh
cd /volume1/tools/syn-tool
sudo git pull
sudo ./start.sh
```

---

## Configuration

All settings (share paths, exclusions, retention, billing formula) are available in the **Settings** tab of the web UI.
