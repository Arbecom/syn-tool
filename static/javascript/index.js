'use strict';

// ===================== TRANSLATIONS =====================
const LANG = {
  en: {
    brand: 'Storage\nManager',
    nav_dashboard: 'Dashboard', nav_excel: 'Excel Data',
    nav_history: 'History',    nav_settings: 'Settings',
    stat_total: 'Total Storage', stat_count: 'Shares', stat_largest: 'Largest Share', stat_excel_rows: 'Customers in Excel',
    nas_shares: 'NAS Shares', refresh: 'Refresh',
    col_name: 'Share Name', col_path: 'Path', col_size: 'Size', col_gb: 'Size (GB)', col_usage: 'Usage',
    loading: 'Loading…', no_shares: 'No shares found. Check share paths in Settings.',
    updated: 'Updated',
    upload_excel: 'Upload Excel', export_excel: 'Export (.xlsx)', save: 'Save',
    sync_from_nas: 'Sync Storage from NAS', add_row: '+ Add Row', unsaved: 'Unsaved',
    col_nas_link: 'NAS Link', no_data: 'No data. Upload an Excel file to start.',
    version_history: 'Version History', uploads_tab: 'Uploads', edits_tab: 'Edits', mappings_tab: 'Links',
    restore: 'Restore', no_history: 'No history available.',
    share_paths: 'Share Paths', exclude_shares: 'Excluded Shares',
    billing_formula: 'Billing Formula',
    mailbox_gb_label: 'GB per mailbox (free)',
    factur_formula_hint: 'Used − (GB × Mailboxes)',
    retention: 'Retention', upload_ret_label: 'Upload retention (max kept)',
    edit_ret_label: 'Edit retention (max kept)',
    save_settings: 'Save Settings', add: 'Add',
    cancel: 'Cancel', confirm: 'Confirm',
    settings_saved: 'Settings saved!', save_failed: 'Save failed: ',
    uploading: 'Uploading Excel…', upload_success: 'Excel uploaded!',
    upload_failed: 'Upload failed: ', save_success: 'Saved!',
    sync_no_links: 'No NAS links set. Use the NAS Link column to link shares.',
    rows_updated: ' row(s) updated from NAS.',
    delete_row_title: 'Delete Row', delete_row_msg: 'Are you sure you want to delete this row?',
    restore_title: 'Restore Version',
    restore_msg: 'Restore "{name}"? Current data will be saved as a snapshot.',
    restore_map_title: 'Restore Links',
    restore_map_msg: 'Restore links from "{name}"? Current links will be saved.',
    mapping_title: 'Update Links', mapping_sub: 'Changes detected compared to stored links.',
    diff_applied: '✓ Automatically linked', diff_new: '+ New customers — link a share',
    diff_removed: '✕ Removed from Excel — keep link?', diff_changed: '⚠ Name changed (link kept)',
    no_link: '— no link —', keep: 'Keep',
    save_links: 'Save Links', skip: 'Skip',
    links_saved: 'Links saved!', links_failed: 'Save failed: ',
    restore_links_success: 'Links restored!', restore_links_failed: 'Restore failed: ',
    volume_info: 'Volume: {total} total, {free} free',
    scanning: 'Scanning {done} of {total}…', scan_error: 'Scan error: ',
    scan_busy: 'Scan already in progress — showing cached data.',
  },
  nl: {
    brand: 'Opslag\nBeheer',
    nav_dashboard: 'Dashboard', nav_excel: 'Excel Data',
    nav_history: 'Geschiedenis', nav_settings: 'Instellingen',
    stat_total: 'Totale opslag', stat_count: 'Shares', stat_largest: 'Grootste share', stat_excel_rows: 'Klanten in Excel',
    nas_shares: 'NAS Shares', refresh: 'Vernieuwen',
    col_name: 'Share naam', col_path: 'Pad', col_size: 'Grootte', col_gb: 'Grootte (GB)', col_usage: 'Gebruik',
    loading: 'Laden…', no_shares: 'Geen shares gevonden. Controleer de share paden in Instellingen.',
    updated: 'Bijgewerkt',
    upload_excel: 'Excel uploaden', export_excel: 'Exporteren (.xlsx)', save: 'Opslaan',
    sync_from_nas: 'Sync opslag van NAS', add_row: '+ Rij toevoegen', unsaved: 'Niet opgeslagen',
    col_nas_link: 'NAS Koppeling', no_data: 'Geen data. Upload een Excel bestand om te beginnen.',
    version_history: 'Versiegeschiedenis', uploads_tab: 'Uploads', edits_tab: 'Bewerkingen', mappings_tab: 'Koppelingen',
    restore: 'Herstellen', no_history: 'Geen geschiedenis beschikbaar.',
    share_paths: 'Share paden', exclude_shares: 'Uitgesloten shares',
    billing_formula: 'Facturatie formule',
    mailbox_gb_label: 'GB per mailbox (gratis)',
    factur_formula_hint: 'Gebruikte − (GB × Mailboxen)',
    retention: 'Retentie', upload_ret_label: 'Upload retentie (max bewaard)',
    edit_ret_label: 'Bewerking retentie (max bewaard)',
    save_settings: 'Instellingen opslaan', add: 'Toevoegen',
    cancel: 'Annuleren', confirm: 'Bevestigen',
    settings_saved: 'Instellingen opgeslagen!', save_failed: 'Opslaan mislukt: ',
    uploading: 'Excel bestand uploaden…', upload_success: 'Excel geüpload!',
    upload_failed: 'Upload mislukt: ', save_success: 'Opgeslagen!',
    sync_no_links: 'Geen NAS koppelingen ingesteld. Gebruik de NAS Koppeling kolom.',
    rows_updated: ' rij(en) bijgewerkt vanuit NAS.',
    delete_row_title: 'Rij verwijderen', delete_row_msg: 'Weet je zeker dat je deze rij wilt verwijderen?',
    restore_title: 'Versie herstellen',
    restore_msg: '"{name}" herstellen? Huidige data wordt als momentopname bewaard.',
    restore_map_title: 'Koppelingen herstellen',
    restore_map_msg: 'Koppelingen van "{name}" herstellen? Huidige koppelingen worden opgeslagen.',
    mapping_title: 'Koppelingen bijwerken', mapping_sub: 'Wijzigingen gevonden ten opzichte van opgeslagen koppelingen.',
    diff_applied: '✓ Automatisch gekoppeld', diff_new: '+ Nieuwe klanten — koppel een share',
    diff_removed: '✕ Niet meer in Excel — koppeling bewaren?', diff_changed: '⚠ Naam gewijzigd (koppeling blijft)',
    no_link: '— geen koppeling —', keep: 'Bewaren',
    save_links: 'Koppelingen opslaan', skip: 'Overslaan',
    links_saved: 'Koppelingen opgeslagen!', links_failed: 'Opslaan mislukt: ',
    restore_links_success: 'Koppelingen hersteld!', restore_links_failed: 'Herstel mislukt: ',
    volume_info: 'Volume: {total} totaal, {free} vrij',
    scanning: '{done} van {total} scannen…', scan_error: 'Scan fout: ',
    scan_busy: 'Scan al bezig — gecachte data wordt getoond.',
  },
};

let lang = 'en';

function translate(key, vars) {
  let text = (LANG[lang] || LANG.en)[key] || key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
  return text;
}

function detectLanguage() {
  const cookieMatch = document.cookie.match(/(?:^|;\s*)lang=([a-z]+)/);
  if (cookieMatch) return cookieMatch[1];
  const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  return browserLang.startsWith('nl') ? 'nl' : 'en';
}

function setLanguage(code) {
  lang = code;
  document.cookie = `lang=${code};path=/;max-age=31536000`;
  document.getElementById('btn-en').classList.toggle('active', code === 'en');
  document.getElementById('btn-nl').classList.toggle('active', code === 'nl');
  applyTranslations();
  rerenderCurrentTab();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === 'INPUT') el.placeholder = translate(key);
    else el.textContent = translate(key);
  });
  const brandEl = document.querySelector('.sidebar-brand > span[data-i18n="brand"]');
  if (brandEl) brandEl.innerHTML = translate('brand').replace('\n', '<br>');
}

function rerenderCurrentTab() {
  const activeNavItem = document.querySelector('.nav-item.active');
  if (!activeNavItem) return;
  const tab = activeNavItem.dataset.tab;
  document.getElementById('page-title').textContent = translate(`nav_${tab}`);
  if (tab === 'dashboard') renderShares();
  if (tab === 'excel')     renderExcel();
  if (tab === 'history')   renderHistory();
  if (tab === 'settings')  renderSettings();
}

// ===================== STATE =====================
const state = {
  shares: [], volumes: {}, activeScanStream: null, sharesUpdatedAt: null,
  sharesSort: { column: 'size_bytes', direction: 'desc' },
  pendingSharePaths: new Set(),
  excelData:  { headers: [], rows: [], _meta: {} },
  editBuffer: [],
  isDirty: false,
  excelSortColumn: null, excelSortDirection: 'asc',
  columnWidths: {},
  history: { uploads: [], edits: [], mappings: [] },
  settings: {},
  shareMappings: { key_col: null, map: {} },
  pendingMappingDiff: null,
};

// ===================== UTILS =====================
function escapeHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatBytes(bytes) {
  const units = ['B','KB','MB','GB','TB']; let unitIndex = 0;
  while (bytes >= 1024 && unitIndex < units.length - 1) { bytes /= 1024; unitIndex++; }
  return `${bytes.toFixed(unitIndex >= 3 ? 2 : 1)} ${units[unitIndex]}`;
}
function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString(lang === 'nl' ? 'nl-NL' : 'en-GB');
}
function setDirty(isDirty) {
  state.isDirty = isDirty;
  document.getElementById('dirty-badge').style.display = isDirty ? '' : 'none';
  if (!state.pendingSharePaths.size) document.getElementById('save-btn').disabled = !isDirty;
}
function isStorageCol(header) {
  const lower = (header || '').toLowerCase();
  return lower.includes('opslag') || lower.includes('storage') || lower.includes('gebruik') ||
         lower.includes('factuur') || lower.includes('factureren') || lower.includes('invoice');
}
function getUnit(header) { return isStorageCol(header) ? 'GB' : ''; }
function findColumn(headers, ...keywords) {
  return headers.find(header => keywords.some(keyword => header.toLowerCase().includes(keyword))) ?? null;
}
function getVolumeTotal(sharePath) {
  for (const [vol, info] of Object.entries(state.volumes)) {
    if (sharePath.startsWith(vol + '/') || sharePath === vol) return info.total_bytes;
  }
  return null;
}

// ===================== TOAST =====================
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.classList.add('fading'); setTimeout(() => el.remove(), 320); }, 3200);
}

// ===================== MODAL =====================
function showConfirm(title, msg, onOk) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent  = msg;
  document.getElementById('modal').showModal();
  const btn = document.getElementById('modal-confirm');
  btn.onclick = () => { closeModal(); onOk(); };
}
function closeModal() { document.getElementById('modal').close(); }

// ===================== AUTH =====================
async function checkAuth() {
  const authStatus = await fetch('/api/auth/status')
    .then(response => response.json())
    .catch(() => ({ authenticated: false, auth_enabled: true }));
  if (authStatus.authenticated || !authStatus.auth_enabled) {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = authStatus.auth_enabled ? '' : 'none';
    return true;
  }
  window.location.href = '/login';
  return false;
}
async function doLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}

// ===================== API =====================
async function apiGet(url) {
  const response = await fetch(url);
  if (response.status === 401) { window.location.href = '/login'; throw new Error('Unauthorized'); }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
async function apiPost(url, data) {
  const response = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  if (response.status === 401) { window.location.href = '/login'; throw new Error('Unauthorized'); }
  if (!response.ok) { const errorData = await response.json().catch(() => ({error:'Unknown error'})); throw new Error(errorData.error || `HTTP ${response.status}`); }
  return response.json();
}
async function apiUpload(url, formData) {
  const response = await fetch(url, { method:'POST', body:formData });
  if (!response.ok) { const errorData = await response.json().catch(() => ({error:'Unknown error'})); throw new Error(errorData.error || `HTTP ${response.status}`); }
  return response.json();
}

// ===================== TABS =====================
function showTab(tab) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.toggle('active', el.id === `tab-${tab}`));
  document.getElementById('page-title').textContent = translate(`nav_${tab}`);
  document.getElementById('header-actions').innerHTML = '';
  if (tab === 'dashboard') loadShares();
  if (tab === 'excel')     loadExcel();
  if (tab === 'history')   loadHistory();
  if (tab === 'settings')  loadSettings();
}

// ===================== DASHBOARD =====================
async function loadShares() {
  if (state.activeScanStream) { state.activeScanStream.close(); state.activeScanStream = null; }
  state.shares = [];

  try {
    const cached = await apiGet('/api/shares/cached');
    if (cached.shares && cached.shares.length) {
      state.shares          = cached.shares;
      state.volumes         = cached.volumes || {};
      state.sharesUpdatedAt = cached.scanned_at || null;
      renderShares();
    } else {
      document.getElementById('shares-body').innerHTML =
        `<tr><td colspan="5" class="empty-state">${translate('loading')}</td></tr>`;
    }
  } catch(_) {
    document.getElementById('shares-body').innerHTML =
      `<tr><td colspan="5" class="empty-state">${translate('loading')}</td></tr>`;
  }

  const warnings = [];
  const eventSource = new EventSource('/api/shares/stream');
  state.activeScanStream = eventSource;

  eventSource.onmessage = messageEvent => {
    const msg = JSON.parse(messageEvent.data);
    if (msg.type === 'busy') {
      state.activeScanStream = null; eventSource.close();
      toast(translate('scan_busy'), 'warning');
    } else if (msg.type === 'discovered') {
      state.shares = msg.shares.map(share => ({
        ...share, scanning: true, size_bytes: null, size_gb: null, size_human: null
      }));
      if (msg.volumes) state.volumes = msg.volumes;
      renderShares();
    } else if (msg.type === 'share') {
      const idx = state.shares.findIndex(share => share.path === msg.share.path);
      const entry = {...msg.share, scanning: false};
      if (idx >= 0) state.shares[idx] = entry; else state.shares.push(entry);
      if (msg.share.pending) state.pendingSharePaths.add(msg.share.path);
      if (msg.warning) warnings.push(`${msg.share.name}: ${msg.warning}`);
      updateExcelPendingState();
      renderShares();
    } else if (msg.type === 'share_update') {
      const idx = state.shares.findIndex(share => share.path === msg.share.path);
      if (idx >= 0) state.shares[idx] = {...msg.share, scanning: false};
      state.pendingSharePaths.delete(msg.share.path);
      if (msg.warning) warnings.push(`${msg.share.name}: ${msg.warning}`);
      updateExcelPendingState();
      renderShares();
    } else if (msg.type === 'error') {
      warnings.push(msg.message);
    } else if (msg.type === 'done') {
      state.volumes = msg.volumes || {};
      onScanComplete(warnings);
    } else if (msg.type === 'all_done') {
      state.pendingSharePaths.clear();
      updateExcelPendingState();
      state.activeScanStream = null; eventSource.close();
      renderShares();
    }
  };

  eventSource.onerror = () => {
    if (state.activeScanStream) { state.activeScanStream.close(); state.activeScanStream = null; }
    state.shares = state.shares.filter(share => !share.scanning);
    state.pendingSharePaths.clear();
    updateExcelPendingState();
    if (!state.shares.length) {
      document.getElementById('shares-body').innerHTML =
        `<tr><td colspan="5" style="color:var(--danger);padding:16px">${translate('scan_error')}Connection lost</td></tr>`;
    } else {
      onScanComplete(warnings);
    }
  };
}

function onScanComplete(warnings) {
  state.sharesUpdatedAt = new Date().toISOString();
  renderShares();
  warnings.forEach(warning => toast(warning, 'warning'));
  document.getElementById('sync-btn').disabled = !state.shares.length || !state.editBuffer.length;
}

function updateExcelPendingState() {
  const hasPending = state.pendingSharePaths.size > 0;
  const exportBtn  = document.getElementById('export-btn');
  const saveBtn    = document.getElementById('save-btn');
  if (exportBtn) exportBtn.disabled = hasPending;
  if (saveBtn && hasPending) saveBtn.disabled = true;
  else if (saveBtn && !hasPending) saveBtn.disabled = !state.isDirty;
}

function sortSharesByColumn(column) {
  if (state.activeScanStream) return;
  if (state.sharesSort.column === column) {
    state.sharesSort.direction = state.sharesSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    state.sharesSort.column    = column;
    state.sharesSort.direction = column === 'size_bytes' || column === 'size_gb' ? 'desc' : 'asc';
  }
  renderShares();
}

function renderShares() {
  const completedShares = state.shares.filter(share => !share.scanning);
  const scanningShares  = state.shares.filter(share =>  share.scanning);

  const sortedCompleted = [...completedShares].sort((a, b) => {
    const valueA = a[state.sharesSort.column] ?? '', valueB = b[state.sharesSort.column] ?? '';
    const numA = parseFloat(valueA), numB = parseFloat(valueB);
    const comparison = (!isNaN(numA) && !isNaN(numB)) ? numA - numB : String(valueA).localeCompare(String(valueB));
    return state.sharesSort.direction === 'asc' ? comparison : -comparison;
  });
  const sortedScanning = [...scanningShares].sort((a, b) => a.name.localeCompare(b.name));
  const allShares = [...sortedCompleted, ...sortedScanning];

  const isActivelyScanning = !!state.activeScanStream;
  const progressBar  = document.getElementById('scan-progress-bar');
  const progressFill = document.getElementById('scan-progress-fill');
  if (progressBar) {
    progressBar.classList.toggle('active', isActivelyScanning);
    if (progressFill && isActivelyScanning && state.shares.length > 0) {
      progressFill.style.width = Math.round(completedShares.length / state.shares.length * 100) + '%';
    }
  }

  const updatedEl = document.getElementById('shares-updated');
  if (updatedEl) {
    updatedEl.classList.toggle('is-scanning', isActivelyScanning);
    if (isActivelyScanning && state.shares.length > 0) {
      updatedEl.textContent = translate('scanning', {done: completedShares.length, total: state.shares.length});
    } else if (state.pendingSharePaths.size > 0) {
      updatedEl.textContent = `Calculating ${state.pendingSharePaths.size} share${state.pendingSharePaths.size > 1 ? 's' : ''}…`;
    } else {
      updatedEl.textContent = state.sharesUpdatedAt ? translate('updated') + ': ' + formatDate(state.sharesUpdatedAt) : '';
    }
  }

  const totalBytes = completedShares.reduce((sum, share) => sum + (share.size_bytes || 0), 0);
  document.getElementById('stat-total').textContent      = completedShares.length ? formatBytes(totalBytes) : '—';
  document.getElementById('stat-count').textContent      = state.shares.length || '—';
  document.getElementById('stat-excel-rows').textContent = state.editBuffer.length || (state.excelData.rows ? state.excelData.rows.length : '—');
  if (completedShares.length) {
    const largest = [...completedShares].sort((a, b) => b.size_bytes - a.size_bytes)[0];
    document.getElementById('stat-largest').textContent      = largest.size_human;
    document.getElementById('stat-largest-name').textContent = largest.name;
  } else {
    document.getElementById('stat-largest').textContent      = '—';
    document.getElementById('stat-largest-name').textContent = '';
  }

  document.querySelectorAll('#shares-table thead th').forEach(th => {
    const column = th.getAttribute('onclick')?.match(/sortSharesByColumn\('(\w+)'\)/)?.[1];
    if (!column) return;
    th.classList.toggle('sort-asc',  state.sharesSort.column === column && state.sharesSort.direction === 'asc');
    th.classList.toggle('sort-desc', state.sharesSort.column === column && state.sharesSort.direction === 'desc');
    const icon = th.querySelector('.sort-icon');
    if (icon) icon.textContent = state.sharesSort.column === column ? (state.sharesSort.direction === 'asc' ? '↑' : '↓') : '↕';
  });

  if (!allShares.length) {
    document.getElementById('shares-body').innerHTML =
      `<tr><td colspan="5"><div class="empty-state">${translate('no_shares')}</div></td></tr>`;
    return;
  }

  document.getElementById('shares-body').innerHTML = allShares.map(share => {
    if (share.scanning) {
      return `<tr class="row-scanning">
        <td><strong>${escapeHtml(share.name)}</strong></td>
        <td class="cell-muted cell-mono">${escapeHtml(share.path)}</td>
        <td><div style="display:flex;align-items:center;gap:6px"><div class="spinner"></div></div></td>
        <td class="cell-mono" style="color:var(--muted)">—</td>
        <td><div class="bar-wrap"><div class="bar-bg"><div class="bar-fill" style="width:0%;background:var(--primary)"></div></div><div style="font-size:10px;color:var(--muted);margin-top:2px">…</div></div></td>
      </tr>`;
    }
    const volTotal    = getVolumeTotal(share.path);
    const denominator = volTotal || totalBytes || 1;
    const percentage  = Math.min(100, (share.size_bytes / denominator * 100));
    const barColor    = percentage > 80 ? 'var(--danger)' : percentage > 60 ? 'var(--warning)' : 'var(--primary)';
    const volumeInfo  = volTotal ? state.volumes[share.base || share.path.split('/').slice(0,2).join('/')] : null;
    const subtitle    = volumeInfo
      ? translate('volume_info', { total: formatBytes(volumeInfo.total_bytes), free: formatBytes(volumeInfo.free_bytes) })
      : '';
    return `<tr title="${escapeHtml(subtitle)}">
      <td><strong>${escapeHtml(share.name)}</strong></td>
      <td class="cell-muted cell-mono">${escapeHtml(share.path)}</td>
      <td><strong>${escapeHtml(share.size_human)}</strong>${share.pending ? ' <span class="spinner" style="width:10px;height:10px;border-width:2px;vertical-align:middle" title="Calculating exact size…"></span>' : ''}</td>
      <td class="cell-mono">${share.size_gb}</td>
      <td>
        <div class="bar-wrap">
          <div class="bar-bg"><div class="bar-fill" style="width:${percentage.toFixed(1)}%;background:${barColor}"></div></div>
          <div style="font-size:10px;color:var(--muted);margin-top:2px">${percentage.toFixed(1)}%${volTotal ? '' : ' *'}</div>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ===================== EXCEL =====================
function computeBilling(row, headers) {
  const mailboxColumn    = findColumn(headers, 'mailbox');
  const usageColumn      = findColumn(headers, 'gebruik', 'used');
  if (!mailboxColumn || !usageColumn) return null;
  const mailboxCount     = parseFloat(row[mailboxColumn]) || 0;
  const usedGb           = parseFloat(row[usageColumn]) || 0;
  const freeGbPerMailbox = parseFloat(state.settings.mailbox_gb ?? 10);
  return Math.round(usedGb - (freeGbPerMailbox * mailboxCount));
}

function getSortedRowIndices() {
  const indices = state.editBuffer.map((_, index) => index);
  if (!state.excelSortColumn) return indices;
  return indices.sort((indexA, indexB) => {
    const valueA = state.editBuffer[indexA][state.excelSortColumn] ?? '';
    const valueB = state.editBuffer[indexB][state.excelSortColumn] ?? '';
    const numA = parseFloat(valueA), numB = parseFloat(valueB);
    const comparison = (!isNaN(numA) && !isNaN(numB)) ? numA - numB : String(valueA).localeCompare(String(valueB), undefined, {numeric:true});
    return state.excelSortDirection === 'asc' ? comparison : -comparison;
  });
}

async function loadExcel() {
  try {
    const data       = await apiGet('/api/excel/current');
    state.excelData  = data;
    state.editBuffer = data.rows ? data.rows.map(row => ({...row})) : [];
    renderExcel();
    setDirty(false);
    document.getElementById('sync-btn').disabled = !state.shares.length || !state.editBuffer.length;
  } catch(error) {
    toast(translate('save_failed') + error.message, 'error');
  }
}

function renderExcel() {
  const headers       = state.excelData.headers || [];
  const meta          = state.excelData._meta   || {};
  const billingColumn = findColumn(headers, 'factuur', 'factureren', 'invoice');
  const mailboxColumn = findColumn(headers, 'mailbox');

  const metaEl = document.getElementById('excel-meta');
  const parts  = [];
  if (meta.original_filename) parts.push(meta.original_filename);
  if (meta.uploaded_at) parts.push(formatDate(meta.uploaded_at));
  if (meta.saved_at)    parts.push(formatDate(meta.saved_at));
  parts.push(`${state.editBuffer.length} rows`);
  metaEl.textContent = parts.join('  •  ');

  if (!headers.length) {
    document.getElementById('excel-thead').innerHTML = '';
    document.getElementById('excel-tbody').innerHTML =
      `<tr><td colspan="10" class="empty-state">${translate('no_data')}</td></tr>`;
    return;
  }

  const thead = document.getElementById('excel-thead');
  thead.innerHTML = '<tr>' +
    headers.map(header => {
      const isSorted  = state.excelSortColumn === header;
      const icon      = isSorted ? (state.excelSortDirection === 'asc' ? '↑' : '↓') : '↕';
      const sortClass = isSorted ? (state.excelSortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : '';
      const colWidth  = state.columnWidths[header] ? `width:${state.columnWidths[header]}px;min-width:${state.columnWidths[header]}px;` : '';
      return `<th class="${sortClass}" data-col="${escapeHtml(header)}" style="${colWidth}cursor:pointer">
        <div class="th-inner">
          <span class="th-text" title="${escapeHtml(header)}">${escapeHtml(header)}</span>
          <span class="sort-icon">${icon}</span>
        </div>
        <div class="resize-handle"></div>
      </th>`;
    }).join('') +
    `<th class="no-sort" style="width:160px"><div class="th-inner"><span class="th-text">${translate('col_nas_link')}</span></div></th>` +
    `<th class="no-sort" style="width:36px"></th>` +
  '</tr>';

  thead.querySelectorAll('th[data-col]').forEach(th => {
    const header      = th.dataset.col;
    const resizeHandle = th.querySelector('.resize-handle');
    th.addEventListener('click', event => { if (!event.target.classList.contains('resize-handle')) sortExcelByColumn(header); });
    if (resizeHandle) {
      resizeHandle.addEventListener('click', event => event.stopPropagation());
      resizeHandle.addEventListener('mousedown', event => startColumnResize(event, th, header));
    }
    if (state.columnWidths[header]) applyColumnWidth(th, header, state.columnWidths[header]);
  });

  const rowIndices = getSortedRowIndices();
  document.getElementById('excel-tbody').innerHTML = rowIndices.map(rowIndex => {
    const row     = state.editBuffer[rowIndex];
    const billing = billingColumn ? computeBilling(row, headers) : null;

    const cells = headers.map(header => {
      const cellValue = row[header] ?? '';
      const unit      = getUnit(header);
      if (header === billingColumn) {
        const displayValue = billing !== null ? billing : cellValue;
        return `<td class="col-calc" style="text-align:right">
          ${displayValue !== '' && displayValue !== null ? `${escapeHtml(String(displayValue))} <span style="color:var(--muted);font-size:11px">GB</span>` : ''}
        </td>`;
      }
      const isNumeric = !isNaN(parseFloat(cellValue)) && header !== headers[0];
      const inputType = (isNumeric && (unit || header === mailboxColumn || header === findColumn(headers,'licent','licentie'))) ? 'number' : 'text';
      const cellHtml  = unit
        ? `<div class="cell-with-unit">
             <input type="${inputType}" value="${escapeHtml(String(cellValue))}" data-row="${rowIndex}" data-col="${escapeHtml(header)}"
               onchange="onCellChanged(${rowIndex},'${escapeHtml(header)}',this.value)"
               oninput="onCellChanged(${rowIndex},'${escapeHtml(header)}',this.value)">
             <span class="cell-unit">${unit}</span>
           </div>`
        : `<input type="${inputType}" value="${escapeHtml(String(cellValue))}" data-row="${rowIndex}" data-col="${escapeHtml(header)}"
             onchange="onCellChanged(${rowIndex},'${escapeHtml(header)}',this.value)"
             oninput="onCellChanged(${rowIndex},'${escapeHtml(header)}',this.value)">`;
      return `<td>${cellHtml}</td>`;
    }).join('');

    const shareSelector = state.shares.length
      ? `<select onchange="onShareLinked(${rowIndex},this.value)">
           <option value="">${translate('no_link')}</option>
           ${state.shares.map(share => `<option value="${escapeHtml(share.name)}" ${row._share===share.name?'selected':''}>${escapeHtml(share.name)} (${escapeHtml(share.size_human)})</option>`).join('')}
         </select>`
      : `<span style="color:var(--muted);font-size:12px">—</span>`;

    return `<tr id="erow-${rowIndex}">
      ${cells}
      <td class="col-nas">${shareSelector}</td>
      <td><button class="btn-icon row-delete btn-sm" onclick="onDeleteRow(${rowIndex})" title="✕">✕</button></td>
    </tr>`;
  }).join('');
}

function sortExcelByColumn(column) {
  if (state.excelSortColumn === column) state.excelSortDirection = state.excelSortDirection === 'asc' ? 'desc' : 'asc';
  else { state.excelSortColumn = column; state.excelSortDirection = 'asc'; }
  renderExcel();
}

function startColumnResize(mouseEvent, headerCell, columnName) {
  mouseEvent.preventDefault();
  const initialX     = mouseEvent.clientX;
  const initialWidth = headerCell.offsetWidth;
  const onMouseMove  = moveEvent => {
    const newWidth = Math.max(40, initialWidth + moveEvent.clientX - initialX);
    headerCell.style.width = headerCell.style.minWidth = newWidth + 'px';
    applyColumnWidth(headerCell, columnName, newWidth);
  };
  const onMouseUp = () => {
    state.columnWidths[columnName] = headerCell.offsetWidth;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function applyColumnWidth(headerCell, columnName, width) {
  const textSpan = headerCell.querySelector('.th-text');
  if (!textSpan) return;
  if (width < 75) {
    textSpan.style.cssText = `max-width:${Math.max(8, width-28)}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:middle`;
    textSpan.title = columnName;
  } else {
    textSpan.style.cssText = '';
    textSpan.title = columnName;
  }
}

function onCellChanged(rowIndex, columnName, newValue) {
  state.editBuffer[rowIndex][columnName] = (newValue === '' ? null : (isNaN(+newValue) ? newValue : +newValue));
  const headers       = state.excelData.headers || [];
  const billingColumn = findColumn(headers, 'factuur', 'factureren', 'invoice');
  if (billingColumn) {
    const billing   = computeBilling(state.editBuffer[rowIndex], headers);
    const rowEl     = document.getElementById(`erow-${rowIndex}`);
    if (rowEl) {
      const billingCell = rowEl.querySelector('.col-calc');
      if (billingCell) billingCell.innerHTML = billing !== null
        ? `${billing} <span style="color:var(--muted);font-size:11px">GB</span>` : '';
    }
  }
  setDirty(true);
}

function onShareLinked(rowIndex, shareName) {
  state.editBuffer[rowIndex]._share = shareName || null;
  setDirty(true);
}

function addRow() {
  const headers = state.excelData.headers || [];
  if (!headers.length) { toast(translate('no_data'), 'warning'); return; }
  const row = {};
  headers.forEach(header => { row[header] = null; });
  const maxSequenceNumber = state.editBuffer.reduce((maxNum, existingRow) => {
    const parsedNum = parseInt(existingRow[headers[0]]);
    return isNaN(parsedNum) ? maxNum : Math.max(maxNum, parsedNum);
  }, 0);
  row[headers[0]] = maxSequenceNumber + 1;
  row._share = null;
  state.editBuffer.push(row);
  state.excelSortColumn = null;
  renderExcel();
  setDirty(true);
}

function onDeleteRow(rowIndex) {
  showConfirm(translate('delete_row_title'), translate('delete_row_msg'), () => {
    state.editBuffer.splice(rowIndex, 1);
    renderExcel();
    setDirty(true);
  });
}

async function onFileSelected(inputElement) {
  const file = inputElement.files[0];
  if (!file) return;
  inputElement.value = '';
  const formData = new FormData();
  formData.append('file', file);
  try {
    toast(translate('uploading'));
    const result         = await apiUpload('/api/excel/upload', formData);
    state.excelData      = result.data;
    state.editBuffer     = result.data.rows.map(row => ({...row}));
    state.excelSortColumn = null;
    renderExcel();
    setDirty(false);
    document.getElementById('sync-btn').disabled = !state.shares.length;
    toast(translate('upload_success'), 'success');
    if (result.mapping_diff && result.mapping_diff.has_diff) showMappingDiff(result.mapping_diff);
  } catch(error) {
    toast(translate('upload_failed') + error.message, 'error');
  }
}

async function saveExcel() {
  try {
    await apiPost('/api/excel/save', { ...state.excelData, rows: state.editBuffer });
    state.excelData.rows = state.editBuffer.map(row => ({...row}));
    setDirty(false);
    toast(translate('save_success'), 'success');
    await autoSaveMappings();
  } catch(error) {
    toast(translate('save_failed') + error.message, 'error');
  }
}

async function exportExcel() {
  if (state.isDirty) await saveExcel();
  window.location.href = '/api/excel/export';
}

async function syncFromNAS() {
  if (!state.shares.length) await loadShares();
  const headers           = state.excelData.headers || [];
  const usedStorageColumn = findColumn(headers, 'gebruik', 'used');
  if (!usedStorageColumn) { toast(translate('sync_no_links'), 'warning'); return; }

  const shareByName = {};
  state.shares.forEach(share => { shareByName[share.name] = share; });

  let updatedCount = 0;
  state.editBuffer.forEach((row, rowIndex) => {
    if (!row._share || !shareByName[row._share]) return;
    row[usedStorageColumn] = shareByName[row._share].size_gb;
    updatedCount++;
    const rowEl = document.getElementById(`erow-${rowIndex}`);
    if (rowEl) { rowEl.classList.remove('row-synced'); void rowEl.offsetWidth; rowEl.classList.add('row-synced'); }
  });

  if (!updatedCount) { toast(translate('sync_no_links'), 'warning'); return; }
  renderExcel();
  setDirty(true);
  toast(`${updatedCount}${translate('rows_updated')}`, 'success');
}

async function autoSaveMappings() {
  const headers = state.excelData.headers || [];
  const keyCol  = findColumn(headers, 'klant', 'naam', 'customer') || findColumn(headers, 'contract');
  const nameCol = findColumn(headers, 'klant', 'naam', 'customer');
  if (!keyCol) return;
  const updates = state.editBuffer
    .filter(row => row._share && String(row[keyCol] || '').trim())
    .map(row => ({
      key:   String(row[keyCol]).trim().toLowerCase(),
      name:  String(row[nameCol] || row[keyCol] || '').trim(),
      share: row._share,
    }));
  if (!updates.length) return;
  try {
    const result        = await apiPost('/api/mappings/save', { key_col: keyCol, updates, remove: [] });
    state.shareMappings = result.mappings;
  } catch(_) {}
}

// ===================== MAPPING DIFF MODAL =====================
function showMappingDiff(diff) {
  state.pendingMappingDiff = diff;
  let html = '';
  if (diff.applied.length) {
    html += `<div class="diff-section diff-applied">
      <div class="diff-section-title">${translate('diff_applied')} (${diff.applied.length})</div>
      ${diff.applied.map(applied => `<div class="diff-item"><div class="diff-item-name">${escapeHtml(applied.name)}<small>${escapeHtml(applied.share||'—')}</small></div></div>`).join('')}
    </div>`;
  }
  if (diff.new.length) {
    html += `<div class="diff-section diff-new">
      <div class="diff-section-title">${translate('diff_new')}</div>
      ${diff.new.map((newEntry, index) => `<div class="diff-item">
        <div class="diff-item-name">${escapeHtml(newEntry.name)}<small>${escapeHtml(newEntry.key)}</small></div>
        <select id="diff-new-${index}" data-key="${escapeHtml(newEntry.key)}" data-name="${escapeHtml(newEntry.name)}">
          <option value="">${translate('no_link')}</option>
          ${state.shares.map(share => `<option value="${escapeHtml(share.name)}">${escapeHtml(share.name)} (${escapeHtml(share.size_human)})</option>`).join('')}
        </select>
      </div>`).join('')}
    </div>`;
  }
  if (diff.removed.length) {
    html += `<div class="diff-section diff-removed">
      <div class="diff-section-title">${translate('diff_removed')}</div>
      ${diff.removed.map((removed, index) => `<div class="diff-item">
        <div class="diff-item-name">${escapeHtml(removed.name)}<small>${escapeHtml(removed.key)} → ${escapeHtml(removed.share||'—')}</small></div>
        <label style="font-size:12px;white-space:nowrap"><input type="checkbox" id="diff-keep-${index}" data-key="${escapeHtml(removed.key)}" checked> ${translate('keep')}</label>
      </div>`).join('')}
    </div>`;
  }
  if (diff.changed.length) {
    html += `<div class="diff-section diff-changed">
      <div class="diff-section-title">${translate('diff_changed')}</div>
      ${diff.changed.map(changed => `<div class="diff-item"><div class="diff-item-name">"${escapeHtml(changed.old_name)}" → "${escapeHtml(changed.new_name)}"<small>${escapeHtml(changed.share||'—')}</small></div></div>`).join('')}
    </div>`;
  }
  document.getElementById('mapping-diff-content').innerHTML = html;
  document.getElementById('mapping-modal').showModal();
}

function closeMappingModal() {
  document.getElementById('mapping-modal').close();
  state.pendingMappingDiff = null;
}

async function saveMappingDecision() {
  const diff = state.pendingMappingDiff;
  if (!diff) { closeMappingModal(); return; }
  const updates = [], remove = [];
  (diff.new || []).forEach((newEntry, index) => {
    const selector = document.getElementById(`diff-new-${index}`);
    updates.push({ key: newEntry.key, name: newEntry.name, share: selector ? selector.value : '' });
  });
  (diff.removed || []).forEach((removed, index) => {
    const checkbox = document.getElementById(`diff-keep-${index}`);
    (checkbox && checkbox.checked)
      ? updates.push({ key: removed.key, name: removed.name, share: removed.share })
      : remove.push(removed.key);
  });
  (diff.changed || []).forEach(changed => updates.push({ key: changed.key, name: changed.new_name, share: changed.share }));
  try {
    const result        = await apiPost('/api/mappings/save', { key_col: diff.key_col, updates, remove });
    state.shareMappings = result.mappings;
    const keyCol = diff.key_col;
    if (keyCol) {
      updates.forEach(update => {
        if (!update.share) return;
        const matchedRow = state.editBuffer.find(bufferRow => String(bufferRow[keyCol]||'').trim().toLowerCase() === update.key);
        if (matchedRow) matchedRow._share = update.share;
      });
      renderExcel();
    }
    toast(translate('links_saved'), 'success');
    closeMappingModal();
  } catch(error) {
    toast(translate('links_failed') + error.message, 'error');
  }
}

// ===================== HISTORY =====================
function showHistoryTab(tabName, buttonElement) {
  document.querySelectorAll('.htab').forEach(button => button.classList.remove('active'));
  buttonElement.classList.add('active');
  document.getElementById('history-uploads').style.display  = tabName === 'uploads'  ? '' : 'none';
  document.getElementById('history-edits').style.display    = tabName === 'edits'    ? '' : 'none';
  document.getElementById('history-mappings').style.display = tabName === 'mappings' ? '' : 'none';
}

async function loadHistory() {
  try {
    const [historyData, mappingHistory] = await Promise.all([apiGet('/api/history'), apiGet('/api/mappings/history')]);
    state.history = { ...historyData, mappings: mappingHistory.snapshots || [] };
    renderHistory();
  } catch(error) {
    toast(translate('save_failed') + error.message, 'error');
  }
}

function renderHistory() {
  renderHistoryList('history-uploads', state.history.uploads, 'upload');
  renderHistoryList('history-edits',   state.history.edits,   'edit');
  renderMappingHistory();
}

function renderHistoryList(elementId, items, type) {
  const el = document.getElementById(elementId);
  if (!items || !items.length) { el.innerHTML = `<li class="empty-state">${translate('no_history')}</li>`; return; }
  el.innerHTML = items.map(item => {
    const meta       = item.meta || {};
    const historyTag = type === 'upload' ? 'upload' : (meta.source?.includes('restore') ? 'restore' : 'edit');
    const label      = { upload:'Upload', edit:'Edit', restore:'Restore' }[historyTag] ?? historyTag;
    const rowCount   = meta.row_count ?? '?';
    const subtitle   = [formatDate(item.modified), meta.original_filename, `${rowCount} rows`].filter(Boolean).join('  •  ');
    return `<li class="history-item">
      <div class="history-info"><div class="history-title">${escapeHtml(item.filename)}</div><div class="history-sub">${escapeHtml(subtitle)}</div></div>
      <div class="history-actions">
        <span class="tag tag-${historyTag}">${label}</span>
        <button class="btn-secondary btn-sm" onclick="restoreVersion('${type}','${escapeHtml(item.id)}','${escapeHtml(item.filename)}')">${translate('restore')}</button>
      </div>
    </li>`;
  }).join('');
}

function renderMappingHistory() {
  const el    = document.getElementById('history-mappings');
  const items = state.history.mappings || [];
  if (!items.length) { el.innerHTML = `<li class="empty-state">${translate('no_history')}</li>`; return; }
  el.innerHTML = items.map(item => `
    <li class="history-item">
      <div class="history-info"><div class="history-title">${escapeHtml(item.filename)}</div><div class="history-sub">${formatDate(item.modified)}  •  ${item.count} links</div></div>
      <div class="history-actions">
        <span class="tag tag-edit">${translate('mappings_tab')}</span>
        <button class="btn-secondary btn-sm" onclick="restoreMappings('${escapeHtml(item.id)}','${escapeHtml(item.filename)}')">${translate('restore')}</button>
      </div>
    </li>`).join('');
}

async function restoreVersion(type, id, filename) {
  showConfirm(translate('restore_title'), translate('restore_msg', {name: filename}), async () => {
    try {
      const url    = type === 'upload'
        ? `/api/history/restore/upload/${encodeURIComponent(id)}`
        : `/api/history/restore/edit/${encodeURIComponent(id)}`;
      const result          = await apiPost(url, {});
      state.excelData       = result.data;
      state.editBuffer      = result.data.rows.map(row => ({...row}));
      state.excelSortColumn = null;
      setDirty(false);
      toast(translate('save_success'), 'success');
      loadHistory();
    } catch(error) { toast(translate('save_failed') + error.message, 'error'); }
  });
}

async function restoreMappings(id, filename) {
  showConfirm(translate('restore_map_title'), translate('restore_map_msg', {name: filename}), async () => {
    try {
      const result        = await apiPost(`/api/mappings/restore/${encodeURIComponent(id)}`, {});
      state.shareMappings = result.mappings;
      applyMappingsToBuffer();
      toast(translate('restore_links_success'), 'success');
      loadHistory();
    } catch(error) { toast(translate('restore_links_failed') + error.message, 'error'); }
  });
}

function applyMappingsToBuffer() {
  const headers = state.excelData.headers || [];
  const keyCol  = findColumn(headers, 'klant', 'naam', 'customer') || findColumn(headers, 'contract');
  if (!keyCol || !state.shareMappings.map) return;
  state.editBuffer.forEach(row => {
    const key   = String(row[keyCol] || '').trim().toLowerCase();
    const entry = state.shareMappings.map[key];
    if (entry && entry.share) row._share = entry.share;
  });
  renderExcel();
  setDirty(true);
}

// ===================== SETTINGS =====================
async function loadSettings() {
  try {
    state.settings = await apiGet('/api/settings');
    renderSettings();
  } catch(error) { toast(translate('save_failed') + error.message, 'error'); }
}

function renderSettings() {
  const config = state.settings;
  document.getElementById('share-paths-list').innerHTML =
    (config.share_paths || []).map((path, index) =>
      `<li class="list-item"><span>${escapeHtml(path)}</span><button class="btn-danger btn-sm" onclick="removeSharePath(${index})">✕</button></li>`
    ).join('');
  document.getElementById('exclude-list').innerHTML =
    (config.exclude_shares || []).map((pattern, index) =>
      `<li class="list-item"><span>${escapeHtml(pattern)}</span><button class="btn-danger btn-sm" onclick="removeExclude(${index})">✕</button></li>`
    ).join('');
  ['upload','edit'].forEach(retentionType => {
    const selectElement = document.getElementById(`${retentionType}-retention`);
    const storedValue   = String(config[`${retentionType}_retention`] || 10);
    Array.from(selectElement.options).forEach(option => { option.selected = option.value === storedValue; });
    if (!Array.from(selectElement.options).some(option => option.selected)) {
      const newOption = document.createElement('option');
      newOption.value = storedValue; newOption.textContent = storedValue; newOption.selected = true;
      selectElement.appendChild(newOption);
    }
  });
  document.getElementById('mailbox-gb').value   = config.mailbox_gb ?? 10;
  document.getElementById('auth-username').value = config.auth_username || 'admin';
  document.getElementById('auth-password').value = '';
}

function addSharePath() {
  const newPath = document.getElementById('new-share-path').value.trim();
  if (!newPath) return;
  state.settings.share_paths = [...(state.settings.share_paths || []), newPath];
  document.getElementById('new-share-path').value = '';
  renderSettings();
}
function removeSharePath(index) { state.settings.share_paths.splice(index, 1); renderSettings(); }

function addExclude() {
  const newPattern = document.getElementById('new-exclude').value.trim();
  if (!newPattern) return;
  state.settings.exclude_shares = [...(state.settings.exclude_shares || []), newPattern];
  document.getElementById('new-exclude').value = '';
  renderSettings();
}
function removeExclude(index) { state.settings.exclude_shares.splice(index, 1); renderSettings(); }

async function saveSettings() {
  try {
    const newPassword = document.getElementById('auth-password').value;
    const payload = {
      share_paths:      state.settings.share_paths,
      exclude_shares:   state.settings.exclude_shares,
      upload_retention: parseInt(document.getElementById('upload-retention').value),
      edit_retention:   parseInt(document.getElementById('edit-retention').value),
      mailbox_gb:       parseFloat(document.getElementById('mailbox-gb').value) || 10,
      auth_username:    document.getElementById('auth-username').value,
    };
    if (newPassword) payload.auth_password = newPassword;
    const result   = await apiPost('/api/settings', payload);
    state.settings = result.config;
    renderSettings();
    toast(translate('settings_saved'), 'success');
  } catch(error) { toast(translate('save_failed') + error.message, 'error'); }
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', async () => {
  lang = detectLanguage();
  setLanguage(lang);

  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => showTab(el.dataset.tab));
  });
  document.getElementById('modal').addEventListener('click', event => {
    if (event.target === document.getElementById('modal')) closeModal();
  });
  document.getElementById('modal').addEventListener('cancel', () => closeModal());
  document.getElementById('mapping-modal').addEventListener('click', event => {
    if (event.target === document.getElementById('mapping-modal')) closeMappingModal();
  });
  document.getElementById('mapping-modal').addEventListener('cancel', () => closeMappingModal());
  window.addEventListener('beforeunload', event => {
    if (state.isDirty) { event.preventDefault(); }
  });

  const isAuthed = await checkAuth();
  if (isAuthed) {
    apiGet('/api/mappings').then(data => { state.shareMappings = data; }).catch(() => {});
    loadShares();
  }
});
