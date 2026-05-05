# Frontend — static/index.html

Single-file SPA, no build step. All CSS and JS inline. Tabs: Dashboard, Excel Data, History, Settings.

## i18n (EN / NL)
- `LANG` object with `en` and `nl` keys (~60 keys each)
- `t(key, vars)` — looks up `LANG[lang][key]`, interpolates `{placeholder}` vars
- `getLangFromEnv()` — cookie `lang=xx` → `navigator.language` → default `'en'`; Dutch if starts with `'nl'`
- `setLang(l)` — sets `lang`, writes cookie `lang=xx;max-age=31536000`, marks active button, re-renders
- `applyI18n()` — updates all `[data-i18n]` elements; brand span uses `innerHTML` for newline → `<br>`
- Language toggle: `<button class="lang-btn" id="btn-en">EN</button>` / `id="btn-nl"` in sidebar footer

## Global state `S`
```js
S = {
  shares: [],           // array of share objects from /api/shares
  volumes: {},          // volume stats keyed by base path e.g. "/volume1"
  shareSort: { col: 'size_bytes', dir: 'desc' },
  excel: { headers:[], rows:[], _meta:{} },  // last server state
  editBuffer: [],       // mutable working copy (objects with _share field)
  dirty: false,
  sortCol: null,        // active Excel sort column (null = no sort)
  sortDir: 'asc',
  colWidths: {},        // { headerName: widthPx } — persisted across re-renders
  history: { uploads:[], edits:[], mappings:[] },
  settings: {},
  mappings: { key_col:null, map:{} },
  pendingDiff: null,    // mapping diff from last upload (shown in modal)
}
```

## Tabs
`showTab(tab)` — toggles `.active` on nav-items and `.tab-content` divs, calls load function.
Tab IDs: `tab-dashboard`, `tab-excel`, `tab-history`, `tab-settings`.

## Dashboard
- `loadShares()` — GETs `/api/shares`, stores in `S.shares` + `S.volumes`, calls `renderShares()`
- `sortSharesBy(col)` — toggles asc/desc on `S.shareSort`, re-renders
- `renderShares()` — sorts, updates stat cards, builds table rows
  - Progress bar denominator: `getVolumeTotal(s.path)` from `os.statvfs()` — falls back to sum of all shares
  - `getVolumeTotal(sharePath)` — matches path against volume keys with `startsWith(vol + '/')`
  - Color: `>80%` danger, `>60%` warning, else primary
  - Row `title` shows `"Volume: X total, Y free"`

## Excel tab

### Load / save / export
- `loadExcel()` — GETs `/api/excel/current`, sets `S.excel` + `S.editBuffer` (shallow copy of rows)
- `saveExcel()` — POSTs `{ ...S.excel, rows: S.editBuffer }`, then calls `autoSaveMappings()`
- `exportExcel()` — saves if dirty, then `window.location.href = '/api/excel/export'`
- `handleUpload(input)` — uploads file, updates state, shows mapping diff modal if `has_diff`

### Table rendering
- `renderExcel()` — builds `<thead>` and `<tbody>` using `getSortedDisplayOrder()`
- Header cell structure:
  ```html
  <th data-col="Header" style="width:Npx">
    <div class="th-inner">
      <span class="th-text" title="Header">Header</span>
      <span class="sort-icon">↕ / ↑ / ↓</span>
    </div>
    <div class="resize-handle"></div>
  </th>
  ```
- Sort click on `th` skips if `e.target` is the resize handle
- `sortExcel(col)` — toggles asc/desc on `S.sortCol`/`S.sortDir`, re-renders

### Sorted display order
- `getSortedDisplayOrder()` — returns original `editBuffer` indices in display order
- Row IDs: `id="erow-{origIdx}"` — always the original index regardless of display sort
- Cell handlers always reference original index: `cellChanged(origIdx, col, val)` / `shareLinked(origIdx, shareName)`

### Column resize
- `.resize-handle` drag: `startColResize(e, th, header)` — updates `th.style.width` live
- `applyColWidth(th, header, width)` — if `width < 75px`: truncates header with ellipsis + tooltip; otherwise clears
- `S.colWidths[header]` persists widths across re-renders

### Storage column detection
- `isStorageCol(header)` — true if header contains `opslag`, `storage`, `gebruik`, `factuur`, `factureren`, `invoice`
- `getUnit(header)` — returns `'GB'` for storage columns, `''` otherwise
- Storage cells: `<div class="cell-with-unit"><input ...><span class="cell-unit">GB</span></div>`

### Billing formula (client-side preview)
- `calcBilling(row, headers)` — `Math.round(gebruikte - (mailbox_gb * mailboxen))`
- `mailbox_gb` from `S.settings.mailbox_gb ?? 10`
- `Te factureren` column is read-only (`.col-calc`), recalculated live on cell change

### Row operations
- `addRow()` — appends row with next sequence number, resets `S.sortCol`, re-renders
- `deleteRow(origIdx)` — confirm modal → splice editBuffer → re-render
- `syncFromNAS()` — fills `Gebruikte opslag` from `S.shares` by `row._share`, adds `.row-synced` flash animation

### Auto-save mappings
`autoSaveMappings()` — called after every `saveExcel()`. Collects all rows with `_share` set and non-empty customer key, POSTs to `/api/mappings/save`. Key column: prefers `klant`/`naam`/`customer`, falls back to `contract`. Keys always `.toLowerCase()`.

## Mapping diff modal
Shown after upload when `mapping_diff.has_diff === true`.
- **applied** (green): already linked — informational
- **new** (blue): new customers — dropdown to pick a share
- **removed** (red): no longer in Excel — checkbox to keep link
- **changed** (yellow): display name changed — informational, link kept automatically
- `saveMappingDecision()` — POSTs to `/api/mappings/save`, applies share links back to `editBuffer`, re-renders
- Clicking backdrop or "Skip" closes without saving

## History tab
Three sub-tabs: Uploads / Edits / Links (mappings).
- `loadHistory()` — parallel GETs `/api/history` and `/api/mappings/history`
- `restoreVersion(type, id, filename)` — confirm → POST restore endpoint
- `restoreMappings(id, filename)` — confirm → POST restore → `applyMappingsToBuffer()`
- `applyMappingsToBuffer()` — applies `S.mappings.map` to `editBuffer` by lowercase customer key

## Settings tab
`loadSettings()` / `renderSettings()` / `saveSettings()`.

### Unified shares table (`id="unified-shares-table"`)
Replaces the old "Exclude Shares" text-input list. Populated in `renderSettings()` from `state.shares` (sorted A–Z). Shows "scan first" message if no shares loaded.

Each row:
- Share name + analyzer badge: `📊 YYYY-MM-DD` (green, `var(--success)`) if `analyzer_date` set, else `Geen rapport` (muted)
- **Scan** checkbox (`.share-scan-cb`, `data-share="name"`): unchecked = add to `exclude_shares` on save. Default: checked unless share is currently in `exclude_shares`.
- **Rapport** checkbox (`.sched-share-cb`, `value="name"`): used by `setupMonthlyReports()`. Default: all checked.

Checkbox states survive re-renders (saved to `prevScan`/`prevRapport` maps before innerHTML overwrite).

`schedSelectAll(bool)` toggles all `.sched-share-cb` checkboxes (Rapport column only).

`saveSettings()` derives `exclude_shares` from: @/# patterns preserved + named exclusions not in table + unchecked Scan rows. Falls back to `state.settings.exclude_shares` if table not rendered.

Fields:
- share_paths (list), mailbox_gb (number)
- upload/edit retention (select 5/10/20/50)
- Auth: `auth-username` text input + `auth-password` password input (blank = keep existing)
- DSM section: `dsm-host`, `dsm-port`, `dsm-user`, `dsm-password` (password input)
  - `renderSettings()` populates DSM fields from `state.settings`; shows `(wachtwoord opgeslagen)` hint when `dsm_password_set` is true
  - `saveSettings()` always sends `dsm_host`, `dsm_port`, `dsm_user`; only sends `dsm_password` if non-empty

### DSM actions
`testDsmConnection()` — `id="dsm-test-btn"` / result in `id="dsm-test-result"`:
- Reads current form values; if password is blank and `state.settings.dsm_password_set` is true, sends `use_stored_password: true` instead
- POSTs to `/api/settings/test_dsm`
- Success: `✓ Verbonden — N rapport(en) gevonden`; failure: `✗ <error>`

`setupMonthlyReports()` — `id="dsm-setup-btn"` / result in `id="dsm-setup-result"`:
- Reads checked shares from `.sched-share-cb` checkboxes; aborts with error if none selected
- Reads schedule from `id="sched-day"` (1–28), `id="sched-hour"` (0–23), `id="sched-minute"` (0–59)
- POSTs `{ shares: [...], day, hour, minute }` to `/api/dsm/setup_monthly_reports`
- Shows inline summary: existing reports count, newly created reports, failed ones, schedule type
  - `monthly`: `✓ Maandelijks schema (dag 1, 03:00)`
  - `weekly_monday`: `⚠ Wekelijks schema — maandelijks niet ondersteund door DSM API`
  - `task_scheduler_monthly`: `✓ Task Scheduler taak aangemaakt (maandelijks, dag 1, 03:00)`
  - no schedule: `✗ Schema instellen mislukt — stel handmatig in via DSM`

Share selection: uses `.sched-share-cb` checkboxes from the unified shares table above (Rapport column). `schedSelectAll(bool)` toggles all.
Schedule picker: `id="sched-day"` / `id="sched-hour"` / `id="sched-minute"` — number inputs, defaults 1 / 3 / 0.

## Auth / Login

### Login overlay
Full-page dark overlay (`#login-overlay`, class `login-overlay`, hidden by default):
```html
<div id="login-overlay" class="hidden">
  <div class="login-card">
    <!-- brand, username input, password input (onkeydown Enter → doLogin), login button, error div -->
  </div>
</div>
```
Logout button (`↩`) in sidebar footer with `id="logout-btn"` calls `doLogout()`.

### Auth functions
- `checkAuth()` — GETs `/api/auth/status`. If `auth_enabled && !authenticated`: shows login overlay, stops init. Otherwise hides overlay, shows logout btn if auth_enabled, proceeds with `loadShares()` etc.
- `showLogin()` / `hideLogin()` — toggles `hidden` class on `#login-overlay`
- `doLogin()` — POSTs `{ username, password }` to `/api/auth/login`. On success: `hideLogin()`, `loadShares()` etc. On fail: shows error in `#login-error`.
- `doLogout()` — POSTs to `/api/auth/logout`, then `checkAuth()`.

### 401 handling in GET/POST helpers
`GET()` and `POST()` both call `showLogin()` on HTTP 401 response instead of propagating the error.

## Utility functions
- `esc(s)` — HTML escape
- `fmtBytes(b)` — auto-unit: B/KB/MB/GB/TB
- `fmtDate(iso)` — `toLocaleString('nl-NL')` or `'en-GB'` based on `lang`
- `setDirty(v)` — shows/hides unsaved badge, enables/disables Save button
- `findCol(headers, ...kws)` — first header containing any keyword (case-insensitive)
- `toast(msg, type)` — bottom-right, auto-dismiss 3.2s (types: info/success/error/warning)
- `showConfirm(title, msg, onOk)` / `closeModal()` — generic confirm modal

## CSS variables
```css
--primary: #3b82f6;  --success: #22c55e;  --warning: #f59e0b;  --danger: #ef4444;
--bg: #f1f5f9;  --card-bg: #ffffff;  --text: #1e293b;  --muted: #64748b;  --border: #e2e8f0;
```

## Init (DOMContentLoaded)
```js
lang = getLangFromEnv();
setLang(lang);
// wire nav click handlers, modal click-outside, beforeunload dirty warning
await checkAuth();  // shows login overlay and stops if not authenticated
GET('/api/mappings').then(d => { S.mappings = d; }).catch(() => {});
loadShares();
```
DOMContentLoaded handler is `async` to allow `await checkAuth()`.
