#!/usr/bin/env python3
"""
Synology NAS Storage Management Tool
- Standalone: Python 3.9 (DSM Package Center, works on DSM 7.0+)
- Docker: see Dockerfile (requires DSM 7.2+)

Scan NAS shares, manage billing Excel, track version history.
"""

import os
import json
import subprocess
import datetime
import io
from pathlib import Path
from flask import Flask, request, jsonify, send_file, send_from_directory
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

app = Flask(__name__, static_folder="static")

# ---------------------------------------------------------------------------
# Paths & defaults
# ---------------------------------------------------------------------------

DATA_DIR    = Path(os.environ.get("DATA_DIR", "./data"))
UPLOADS_DIR = DATA_DIR / "uploads"
EDITS_DIR   = DATA_DIR / "edits"
CURRENT_FILE = DATA_DIR / "current.json"
CONFIG_FILE  = DATA_DIR / "config.json"

DEFAULT_CONFIG = {
    "share_paths":       ["/volume1"],
    "exclude_shares":    ["@eaDir", "@sharebin", "#recycle", "@tmp", "homes"],
    "upload_retention":  10,
    "edit_retention":    10,
    "mailbox_gb":        10,    # GB included per mailbox (Te factureren = Gebruikte - mailbox_gb * Mailboxen)
}

# ---------------------------------------------------------------------------
# Config helpers
# ---------------------------------------------------------------------------

def ensure_dirs():
    for d in [DATA_DIR, UPLOADS_DIR, EDITS_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def load_config() -> dict:
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            cfg = json.load(f)
        for k, v in DEFAULT_CONFIG.items():
            cfg.setdefault(k, v)
        return cfg
    return dict(DEFAULT_CONFIG)


def save_config(cfg: dict):
    with open(CONFIG_FILE, "w") as f:
        json.dump(cfg, f, indent=2)

# ---------------------------------------------------------------------------
# NAS share scanning
# ---------------------------------------------------------------------------

def dir_size_bytes(path: str) -> int:
    """Return total size in bytes. Uses 'du -sb' for speed, falls back to walk."""
    try:
        r = subprocess.run(
            ["du", "-sb", path],
            capture_output=True, text=True, timeout=60
        )
        if r.returncode == 0:
            return int(r.stdout.split()[0])
    except Exception:
        pass
    # Fallback: scandir walk
    total = 0
    try:
        with os.scandir(path) as it:
            for e in it:
                try:
                    if e.is_file(follow_symlinks=False):
                        total += e.stat(follow_symlinks=False).st_size
                    elif e.is_dir(follow_symlinks=False):
                        total += dir_size_bytes(e.path)
                except OSError:
                    pass
    except OSError:
        pass
    return total


def bytes_to_gb(b: int) -> float:
    return round(b / (1024 ** 3), 2)


def human_size(b: int) -> str:
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if b < 1024:
            return f"{b:.1f} {unit}"
        b /= 1024
    return f"{b:.1f} PB"


@app.route("/api/shares")
def api_shares():
    cfg = load_config()
    shares = []
    for base in cfg["share_paths"]:
        if not os.path.isdir(base):
            continue
        try:
            with os.scandir(base) as it:
                for e in it:
                    if not e.is_dir(follow_symlinks=False):
                        continue
                    n = e.name
                    if n in cfg["exclude_shares"]:
                        continue
                    if n.startswith(("@", "#")):
                        continue
                    sb = dir_size_bytes(e.path)
                    shares.append({
                        "name":       n,
                        "path":       e.path,
                        "size_bytes": sb,
                        "size_gb":    bytes_to_gb(sb),
                        "size_human": human_size(sb),
                    })
        except OSError:
            pass
    shares.sort(key=lambda x: x["size_bytes"], reverse=True)
    return jsonify({"shares": shares})

# ---------------------------------------------------------------------------
# Excel parsing / creation
# ---------------------------------------------------------------------------

def _json_safe(v):
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.isoformat()
    return v


def parse_excel(path: str) -> dict:
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    rows_raw = list(ws.iter_rows(values_only=True))
    wb.close()

    if not rows_raw:
        return {"headers": [], "rows": []}

    headers = [str(c).strip() if c is not None else "" for c in rows_raw[0]]

    rows = []
    for raw in rows_raw[1:]:
        if all(c is None for c in raw):
            continue
        row = {}
        for i, h in enumerate(headers):
            row[h] = _json_safe(raw[i] if i < len(raw) else None)
        rows.append(row)

    return {"headers": headers, "rows": rows}


def _find_col(headers: list, *keywords) -> str | None:
    """Return first header that contains any of the keywords (case-insensitive)."""
    for h in headers:
        hl = h.lower()
        if any(k in hl for k in keywords):
            return h
    return None


def build_excel(data: dict, cfg: dict | None = None) -> openpyxl.Workbook:
    headers    = data.get("headers", [])
    rows       = data.get("rows", [])
    mailbox_gb = (cfg or load_config()).get("mailbox_gb", 10)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Opslag"

    yellow = PatternFill(start_color="FFFF00", end_color="FFFF00", fill_type="solid")
    bold   = Font(bold=True)
    center = Alignment(horizontal="center")

    # Write headers
    for ci, h in enumerate(headers, 1):
        c = ws.cell(row=1, column=ci, value=h)
        c.font  = bold
        c.fill  = yellow
        c.alignment = center

    # Identify special columns for formula reconstruction
    mailbox_h  = _find_col(headers, "mailbox")
    gebruik_h  = _find_col(headers, "gebruik", "used storage")
    factuur_h  = _find_col(headers, "factur", "invoice")

    def hdr_letter(h):
        if h is None:
            return None
        try:
            idx = headers.index(h) + 1
            return get_column_letter(idx)
        except ValueError:
            return None

    m_letter = hdr_letter(mailbox_h)
    g_letter = hdr_letter(gebruik_h)
    f_idx    = (headers.index(factuur_h) + 1) if factuur_h and factuur_h in headers else None

    for ri, row in enumerate(rows, 2):
        for ci, h in enumerate(headers, 1):
            # Re-insert billing formula if all columns are known
            if f_idx == ci and m_letter and g_letter:
                ws.cell(row=ri, column=ci,
                        value=f"={g_letter}{ri}-({mailbox_gb}*{m_letter}{ri})")
            else:
                v = row.get(h)
                ws.cell(row=ri, column=ci, value=v)

    # Auto-width
    for col in ws.columns:
        w = max((len(str(c.value or "")) for c in col), default=8)
        ws.column_dimensions[get_column_letter(col[0].column)].width = min(w + 2, 45)

    return wb

# ---------------------------------------------------------------------------
# Version / history helpers
# ---------------------------------------------------------------------------

def _ts() -> str:
    return datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")


def _snapshot_current(reason: str = "pre-save"):
    """Save a snapshot of current.json to edits/ before overwriting."""
    if not CURRENT_FILE.exists():
        return
    with open(CURRENT_FILE) as f:
        old = json.load(f)
    old["_snap_reason"] = reason
    old["_snap_at"]     = datetime.datetime.now().isoformat()
    snap = EDITS_DIR / f"{_ts()}.json"
    with open(snap, "w") as f:
        json.dump(old, f, indent=2, default=str)


def _write_current(data: dict):
    _snapshot_current()
    with open(CURRENT_FILE, "w") as f:
        json.dump(data, f, indent=2, default=str)


def _apply_retention(directory: Path, pattern: str, keep: int):
    files = sorted(directory.glob(pattern),
                   key=lambda x: x.stat().st_mtime, reverse=True)
    for f in files[keep:]:
        try:
            f.unlink()
        except OSError:
            pass

# ---------------------------------------------------------------------------
# Excel API routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/api/excel/current")
def api_excel_current():
    if not CURRENT_FILE.exists():
        return jsonify({"headers": [], "rows": [], "_meta": {}})
    with open(CURRENT_FILE) as f:
        return jsonify(json.load(f))


@app.route("/api/excel/upload", methods=["POST"])
def api_excel_upload():
    if "file" not in request.files:
        return jsonify({"error": "Geen bestand opgegeven"}), 400
    file = request.files["file"]
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        return jsonify({"error": "Alleen .xlsx of .xls bestanden zijn toegestaan"}), 400

    cfg      = load_config()
    orig     = file.filename
    savename = f"{_ts()}_{orig}"
    dest     = UPLOADS_DIR / savename
    file.save(str(dest))

    try:
        data = parse_excel(str(dest))
        data["_meta"] = {
            "source":            "upload",
            "original_filename": orig,
            "upload_id":         savename,
            "uploaded_at":       datetime.datetime.now().isoformat(),
            "row_count":         len(data["rows"]),
        }
        _write_current(data)
        _apply_retention(UPLOADS_DIR, "*.xlsx", cfg["upload_retention"])
        _apply_retention(UPLOADS_DIR, "*.xls",  cfg["upload_retention"])
        _apply_retention(EDITS_DIR,   "*.json", cfg["edit_retention"])
        return jsonify({"success": True, "data": data})
    except Exception as e:
        try:
            dest.unlink()
        except OSError:
            pass
        return jsonify({"error": str(e)}), 500


@app.route("/api/excel/save", methods=["POST"])
def api_excel_save():
    body = request.get_json()
    if not body:
        return jsonify({"error": "Geen data ontvangen"}), 400

    cfg = load_config()
    body.setdefault("_meta", {})
    body["_meta"].update({
        "source":    "edit",
        "saved_at":  datetime.datetime.now().isoformat(),
        "row_count": len(body.get("rows", [])),
    })
    _write_current(body)
    _apply_retention(EDITS_DIR, "*.json", cfg["edit_retention"])
    return jsonify({"success": True})


@app.route("/api/excel/export")
def api_excel_export():
    if not CURRENT_FILE.exists():
        return jsonify({"error": "Geen data om te exporteren"}), 404
    with open(CURRENT_FILE) as f:
        data = json.load(f)

    wb  = build_excel(data, load_config())
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)

    fname = f"opslag_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return send_file(
        buf,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=fname,
    )

# ---------------------------------------------------------------------------
# History API routes
# ---------------------------------------------------------------------------

@app.route("/api/history")
def api_history():
    uploads = []
    for f in sorted(UPLOADS_DIR.glob("*"), key=lambda x: x.stat().st_mtime, reverse=True):
        uploads.append({
            "id":       f.stem,
            "filename": f.name,
            "size":     f.stat().st_size,
            "modified": datetime.datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
            "type":     "upload",
        })

    edits = []
    for f in sorted(EDITS_DIR.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
        meta = {}
        try:
            with open(f) as fp:
                d = fp.read(4096)           # read just enough for metadata
                d = json.loads(d)
                meta = d.get("_meta", {})
                meta["_snap_reason"] = d.get("_snap_reason", "")
                meta["row_count"]    = len(d.get("rows", []))
        except Exception:
            pass
        edits.append({
            "id":       f.stem,
            "filename": f.name,
            "modified": datetime.datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
            "meta":     meta,
            "type":     "edit_snapshot",
        })

    return jsonify({"uploads": uploads, "edits": edits})


@app.route("/api/history/restore/upload/<upload_id>", methods=["POST"])
def api_restore_upload(upload_id):
    upload_id = Path(upload_id).name          # prevent path traversal
    matches = list(UPLOADS_DIR.glob(f"{upload_id}*"))
    if not matches:
        return jsonify({"error": "Upload niet gevonden"}), 404

    cfg = load_config()
    try:
        data = parse_excel(str(matches[0]))
        data["_meta"] = {
            "source":       "restore_from_upload",
            "restored_from": upload_id,
            "restored_at":  datetime.datetime.now().isoformat(),
            "row_count":    len(data["rows"]),
        }
        _write_current(data)
        _apply_retention(EDITS_DIR, "*.json", cfg["edit_retention"])
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/history/restore/edit/<edit_id>", methods=["POST"])
def api_restore_edit(edit_id):
    edit_id   = Path(edit_id).name
    edit_path = EDITS_DIR / f"{edit_id}.json"
    if not edit_path.exists():
        return jsonify({"error": "Momentopname niet gevonden"}), 404

    cfg = load_config()
    with open(edit_path) as f:
        data = json.load(f)

    data.setdefault("_meta", {})
    data["_meta"].update({
        "source":       "restore_from_edit",
        "restored_from": edit_id,
        "restored_at":  datetime.datetime.now().isoformat(),
    })
    _write_current(data)
    _apply_retention(EDITS_DIR, "*.json", cfg["edit_retention"])
    return jsonify({"success": True, "data": data})

# ---------------------------------------------------------------------------
# Settings API routes
# ---------------------------------------------------------------------------

@app.route("/api/settings", methods=["GET"])
def api_settings_get():
    return jsonify(load_config())


@app.route("/api/settings", methods=["POST"])
def api_settings_post():
    body = request.get_json()
    if not body:
        return jsonify({"error": "Geen data ontvangen"}), 400

    cfg = load_config()

    for key in ("share_paths", "exclude_shares"):
        if key in body and isinstance(body[key], list):
            cfg[key] = [str(v).strip() for v in body[key] if str(v).strip()]

    for key in ("upload_retention", "edit_retention"):
        if key in body:
            val = int(body[key])
            if 1 <= val <= 100:
                cfg[key] = val

    if "mailbox_gb" in body:
        val = float(body["mailbox_gb"])
        if val >= 0:
            cfg["mailbox_gb"] = val

    save_config(cfg)
    _apply_retention(UPLOADS_DIR, "*.xlsx", cfg["upload_retention"])
    _apply_retention(UPLOADS_DIR, "*.xls",  cfg["upload_retention"])
    _apply_retention(EDITS_DIR,   "*.json", cfg["edit_retention"])
    return jsonify({"success": True, "config": cfg})

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    ensure_dirs()
    port  = int(os.environ.get("PORT", 8080))
    host  = os.environ.get("HOST", "0.0.0.0")
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    print(f"Synology Storage Tool  →  http://{host}:{port}")
    print(f"Data directory         →  {DATA_DIR.resolve()}")
    app.run(host=host, port=port, debug=debug)
