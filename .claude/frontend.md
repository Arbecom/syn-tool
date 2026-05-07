# Frontend — static/html/index.html + static/javascript/index.js + static/css/index.css

Single-file SPA served from Flask. No build step, no npm. Tabs: Dashboard, Excel Data, History, Settings.
JS lives in `static/javascript/index.js`, CSS in `static/css/index.css`, HTML in `static/html/index.html`.

## i18n (EN / NL)

- `LANG` object with `en` and `nl` keys (~70 keys each)
- `translate(key, vars)` — looks up `LANG[lang][key]`, interpolates `{placeholder}` vars
- `detectLanguage()` — cookie `lang=xx` → `navigator.language` → default `'en'`; Dutch if starts with `'nl'`
- `setLanguage(code)` — sets `lang`, writes cookie, marks active button, calls `applyTranslations()` + `rerenderCurrentTab()`
- `applyTranslations()` — updates all `[data-i18n]` elements (textContent or placeholder for `<input>`); also handles `[data-i18n-placeholder]` for password inputs; brand span uses `innerHTML` for newline → `<br>`
- Language toggle: `<button class="lang-btn" id="btn-en">EN</button>` / `id="btn-nl"` in sidebar footer
- Default is `'en'`; Dutch only shown when browser/OS locale starts with `'nl'` or cookie overrides

## Global state `state`

```js
state = {
  shares: [],              // array of share objects from /api/shares/stream + /api/shares/cached
  volumes: {},             // volume stats keyed by base path e.g. "/volume1"
  activeScanStream: null,  // active EventSource, or null
  sharesUpdatedAt: null,   // ISO string — timestamp of last completed scan or cached scanned_at
  sharesFromCache: false,  // true when showing data from shares_cache.json (not a fresh scan)
  sharesSort: { column: 'size_bytes', direction: 'desc' },
  pendingSharePaths: new Set(),  // legacy, always empty — all shares emit pending: false
  excelData:  { headers: [], rows: [], _meta: {} },  // last server state
  editBuffer: [],          // mutable working copy (objects with _share field)
  isDirty: false,
  excelSortColumn: null,   // active Excel sort column (null = no sort)
  excelSortDirection: 'asc',
  columnWidths: {},        // { headerName: widthPx } — persisted across re-renders
  history: { uploads: [], edits: [], mappings: [] },
  settings: {},
  shareMappings: { key_col: null, map: {} },
  pendingMappingDiff: null,  // mapping diff from last upload (shown in modal)
}
```

## Tabs

`showTab(tab)` — toggles `.active` on nav-items and `.tab-content` divs, clears `#header-actions`, calls load function.
Tab IDs: `tab-dashboard`, `tab-excel`, `tab-history`, `tab-settings`.

## Dashboard

- `loadShares()` — first loads `GET /api/shares/cached` to show last known data immediately (sets `state.sharesFromCache = true`), then opens SSE stream `GET /api/shares/stream`
- `onScanComplete(warnings)` — called when SSE stream sends `done`; sets `state.sharesUpdatedAt` to now, sets `state.sharesFromCache = false`, shows any warnings as toasts
- `sortSharesByColumn(col)` — toggles asc/desc on `state.sharesSort`, re-renders
- `renderShares()` — sorts, updates stat cards, builds table rows, updates progress bar + status text

### Status indicator (`#shares-updated`)

- **Scanning**: shows `translate('scanning', {done, total})` — no color override
- **Cached data** (`state.sharesFromCache && !scanning`): shows `translate('cached_since', {date})` in `var(--warning)` amber
- **Fresh scan done**: shows `translate('updated') + ': ' + formatDate(state.sharesUpdatedAt)` — no color override

### Share row badges (driven by `share.size_source`)

| `size_source` | Badge shown |
| --- | --- |
| `"analyzer_fresh"` | `📊 YYYY-MM-DD` (date from current scan) |
| `"analyzer_cached"` | `📊 YYYY-MM-DD` (date from cache) or `📊` if no date stored |
| `"btrfs_live"` | none |
| `"btrfs_cached"` | amber `Cached` badge with tooltip |

Backward compat: if `size_source` absent (old `shares_cache.json`), inferred from `analyzer_date` / `is_from_cache`.

Volume info tooltip (`Volume: X total, Y free`) is on the usage `<td>` only, not the whole `<tr>`.

## Excel tab

### Load / save / export

- `loadExcel()` — GETs `/api/excel/current`, sets `state.excelData` + `state.editBuffer` (shallow copy of rows)
- `saveExcel()` — POSTs `{ ...state.excelData, rows: state.editBuffer }`, then calls `autoSaveMappings()`
- `exportExcel()` — saves if dirty, then `window.location.href = '/api/excel/export'`
- `onFileSelected(input)` — uploads file via `apiUpload()`, updates state, shows mapping diff modal if `has_diff`

### Table rendering

- `renderExcel()` — builds `<thead>` and `<tbody>` using `getSortedRowIndices()`
- Header cell structure:

  ```html
  <th data-col="Header" style="width:Npx;cursor:pointer">
    <div class="th-inner">
      <span class="th-text" title="Header">Header</span>
      <span class="sort-icon">↕ / ↑ / ↓</span>
    </div>
    <div class="resize-handle"></div>
  </th>
  ```

- Sort click on `th` skips if `e.target` is the resize handle
- `sortExcelByColumn(col)` — toggles asc/desc on `state.excelSortColumn`/`state.excelSortDirection`, re-renders

### Sorted display order

- `getSortedRowIndices()` — returns original `editBuffer` indices in display order
- Cell handlers always reference original index: `onCellChanged(origIdx, col, val)` / `onShareLinked(origIdx, shareName)`

### Column resize

- `.resize-handle` drag: `startColumnResize(e, th, header)` — updates `th.style.width` live
- `applyColumnWidth(th, header, width)` — if `width < 75px`: truncates header with ellipsis + tooltip; otherwise clears
- `state.columnWidths[header]` persists widths across re-renders

### Storage column detection

- `isStorageCol(header)` — true if header contains `opslag`, `storage`, `gebruik`, `factuur`, `factureren`, `invoice`
- `getUnit(header)` — returns `'GB'` for storage columns, `''` otherwise
- Storage cells: `<div class="cell-with-unit"><input ...><span class="cell-unit">GB</span></div>`

### Billing formula (client-side preview)

- `computeBilling(row, headers)` — `Math.round(gebruikte - (mailbox_gb * mailboxen))`
- `mailbox_gb` from `state.settings.mailbox_gb ?? 10`
- `Te factureren` column is read-only (`.col-calc`), recalculated live on cell change

### Row operations

- `addRow()` — appends row with next sequence number, resets `state.excelSortColumn`, re-renders
- `deleteRow(origIdx)` — confirm modal → splice editBuffer → re-render
- `syncFromNAS()` — fills `Gebruikte opslag` from `state.shares` by `row._share`, adds `.row-synced` flash animation

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
- `applyMappingsToBuffer()` — applies `state.shareMappings.map` to `editBuffer` by lowercase customer key

## Settings tab

`loadSettings()` / `renderSettings()` / `saveSettings()`.

### Layout

Two-column CSS grid (`.settings-grid` with two `.settings-col` children) on screens wider than 900px; single column below.

- **Left column**: Share Paths, Shares (scan checkbox table)
- **Right column**: Billing Formula, Retention, Login, DSM Storage Analyzer
- Save Settings button spans full width below the grid

### Unified shares table (`id="unified-shares-table"`)

Populated in `renderSettings()` from `state.shares` (sorted A–Z). Shows `translate('scan_first')` if no shares loaded.

Each row (Scan checkbox left, share name + badge right):

- **Scan** checkbox (`.share-scan-cb`, `data-share="name"`): unchecked = add to `exclude_shares` on save. Default: checked unless share is currently in `exclude_shares`.
- Share name + badge: uses `size_source` — shows `📊 date` for analyzer, `translate('no_report')` otherwise.

Checkbox states survive re-renders (saved to `prevScan` map before innerHTML overwrite).

`saveSettings()` derives `exclude_shares` from: @/# patterns preserved + named exclusions not in table + unchecked Scan rows. Falls back to `state.settings.exclude_shares` if table not rendered.

### Fields

All labels, placeholders, and hint text go through `translate()` or `data-i18n` / `data-i18n-placeholder` attributes:

- share_paths (list), mailbox_gb (number)
- upload/edit retention (select 5/10/20/50)
- Auth: `auth-username` text + `auth-password` password (blank = keep existing, placeholder via `data-i18n-placeholder="password_blank"`)
- DSM section: `dsm-host`, `dsm-port`, `dsm-user`, `dsm-password` (blank = unchanged, placeholder via `data-i18n-placeholder="password_blank_dsm"`)
  - `renderSettings()` shows/hides `#dsm-password-set` span (`data-i18n="dsm_password_set_hint"`) when `dsm_password_set` is true
  - `saveSettings()` always sends `dsm_host`, `dsm_port`, `dsm_user`; only sends `dsm_password` if non-empty

### DSM actions

`testDsmConnection()` — `id="dsm-test-btn"` / result in `id="dsm-test-result"`:

- Shows `translate('testing')` while running
- If password blank and `state.settings.dsm_password_set` is true, sends `use_stored_password: true`
- POSTs to `/api/settings/test_dsm`
- Success: `translate('connected_found_reports', {count})` in green; failure: `✗ <error>` in red

## Auth / Login

Auth redirects to a separate `/login` page (not an overlay). `checkAuth()` calls `GET /api/auth/status`; if unauthenticated it navigates to `/login`. `doLogout()` POSTs to `/api/auth/logout` then navigates to `/login`. `apiGet()`/`apiPost()` redirect to `/login` on HTTP 401.

## Utility functions

- `escapeHtml(str)` — HTML escape
- `formatBytes(bytes)` — auto-unit: B/KB/MB/GB/TB
- `formatDate(isoString)` — `toLocaleString('nl-NL')` or `'en-GB'` based on `lang`
- `setDirty(isDirty)` — shows/hides unsaved badge, enables/disables Save button
- `findColumn(headers, ...keywords)` — first header containing any keyword (case-insensitive)
- `toast(msg, type)` — bottom-right, auto-dismiss 3.2s (types: info/success/error/warning); error/warning stay 9s
- `showConfirm(title, msg, onOk)` / `closeModal()` — generic confirm `<dialog>`
- `getVolumeTotal(sharePath)` — matches path against `state.volumes` keys

## CSS variables

```css
--primary: #3b82f6;  --success: #22c55e;  --warning: #f59e0b;  --danger: #ef4444;
--bg: #f1f5f9;  --card-bg: #ffffff;  --text: #1e293b;  --muted: #64748b;  --border: #e2e8f0;
--radius: 8px;
```

## Settings CSS

```css
.settings-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 40px; align-items:start; }
@media (max-width:900px) { .settings-grid { grid-template-columns:1fr; } }
.form-label { width:130px; }
```

## Init (DOMContentLoaded)

```js
lang = detectLanguage();
setLanguage(lang);
// wire nav click handlers, modal click-outside, beforeunload dirty warning
const isAuthed = await checkAuth();  // redirects to /login if not authenticated
if (isAuthed) {
  apiGet('/api/mappings').then(data => { state.shareMappings = data; }).catch(() => {});
  loadShares();
}
```

DOMContentLoaded handler is `async` to allow `await checkAuth()`.
