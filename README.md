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
