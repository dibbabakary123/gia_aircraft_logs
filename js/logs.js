/**
 * GIA Aircraft Log System
 * logs.js — Log entry creation, deletion, and table rendering
 */

// ── PAX AUTO-TOTAL ──
function calcPaxTotals() {
  const sum = sel => [...document.querySelectorAll(sel)]
    .reduce((a, b) => a + (parseInt(b.value) || 0), 0);
  document.getElementById('tot-arr').textContent = sum('.arr-pax');
  document.getElementById('tot-dep').textContent = sum('.dep-pax');
  document.getElementById('tot-trn').textContent = sum('.trn-pax');
}

// Wire up pax inputs
document.querySelectorAll('.arr-pax, .dep-pax, .trn-pax').forEach(input => {
  input.addEventListener('input', calcPaxTotals);
});

// ── SAVE LOG ENTRY ──
function saveLog() {
  if (!currentUser) { showToast('Not signed in', 'error'); return; }

  const flt = document.getElementById('f-flt').value.trim().toUpperCase();
  if (!flt) { showToast('⚠ Flight number required', 'error'); return; }

  const arrPax = [...document.querySelectorAll('.arr-pax')].map(i => parseInt(i.value) || 0);
  const depPax = [...document.querySelectorAll('.dep-pax')].map(i => parseInt(i.value) || 0);
  const trnPax = [...document.querySelectorAll('.trn-pax')].map(i => parseInt(i.value) || 0);

  const entry = {
    id:           'LOG-' + String(logs.length + 1).padStart(3, '0'),
    actype:       document.getElementById('f-actype').value.toUpperCase(),
    reg:          document.getElementById('f-reg').value.toUpperCase(),
    flt,
    date:         document.getElementById('f-date').value,
    sta:          document.getElementById('f-sta').value,
    ata:          document.getElementById('f-ata').value,
    std:          document.getElementById('f-std').value,
    atd:          document.getElementById('f-atd').value,
    sgt:          parseInt(document.getElementById('f-sgt').value)    || 0,
    agt:          parseInt(document.getElementById('f-agt').value)    || 0,
    dest:         document.getElementById('f-dest').value.toUpperCase(),
    hcn:          document.getElementById('f-hcn').value,
    arrPax, depPax, trnPax,
    totArr:       arrPax.reduce((a, b) => a + b, 0),
    totDep:       depPax.reduce((a, b) => a + b, 0),
    totTrn:       trnPax.reduce((a, b) => a + b, 0),
    frtin:        parseInt(document.getElementById('f-frtin').value)  || 0,
    frtout:       parseInt(document.getElementById('f-frtout').value) || 0,
    trnfrt:       parseInt(document.getElementById('f-trnfrt').value) || 0,
    mlsin:        parseInt(document.getElementById('f-mlsin').value)  || 0,
    mlsout:       parseInt(document.getElementById('f-mlsout').value) || 0,
    trnmls:       document.getElementById('f-trnmls').value || 'NIL',
    shift:        document.getElementById('f-shift').value,
    remarks:      document.getElementById('f-remarks').value,
    loggedBy:     currentUser.username,
    loggedByName: currentUser.name,
    loggedByRole: currentUser.role,
    savedAt:      new Date().toISOString()
  };

  logs.unshift(entry);
  saveLogs();
  addAudit('Log Created', `${entry.id} — Flight ${entry.flt} / ${entry.dest}`, 'create');
  showToast('✓ Log entry ' + entry.id + ' saved');
  resetForm();
  renderDashboard();
}

// ── RESET FORM ──
function resetForm() {
  const ids = [
    'f-actype','f-reg','f-flt','f-sta','f-ata','f-std','f-atd',
    'f-dest','f-hcn','f-sgt','f-agt','f-frtin','f-frtout',
    'f-trnfrt','f-mlsin','f-mlsout','f-trnmls','f-remarks'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('.arr-pax,.dep-pax,.trn-pax').forEach(i => i.value = '');
  calcPaxTotals();
  document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
}

// Set today as default date on load
document.getElementById('f-date').value = new Date().toISOString().split('T')[0];

// ── DELETE LOG ──
function deleteLog(id) {
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'supervisor') {
    showToast('⚠ Permission denied', 'error');
    return;
  }
  const l = logs.find(x => x.id === id);
  showConfirm(
    'Delete Log Entry',
    `Permanently delete log entry <b>${l?.id}</b> for flight <b>${l?.flt}</b>?<br>This action cannot be undone.`,
    () => {
      addAudit('Log Deleted', `${l?.id} — Flight ${l?.flt}`, 'delete');
      logs = logs.filter(x => x.id !== id);
      saveLogs();
      closeDetail();
      renderLogTable();
      renderDashboard();
      showToast('Entry deleted');
    }
  );
}

// ── RENDER LOG TABLE ──
function renderLogTable() {
  const q   = document.getElementById('search-input').value.toLowerCase();
  const acf = document.getElementById('filter-ac').value;
  const shf = document.getElementById('filter-shift').value;
  const uf  = document.getElementById('filter-user').value;

  // Populate A/C type filter
  const types  = [...new Set(logs.map(l => l.actype).filter(Boolean))];
  const acSel  = document.getElementById('filter-ac');
  const acCur  = acSel.value;
  acSel.innerHTML = '<option value="">All A/C Types</option>' +
    types.map(t => `<option value="${t}"${t === acCur ? ' selected' : ''}>${t}</option>`).join('');

  // Populate user filter
  const unames = [...new Set(logs.map(l => l.loggedBy).filter(Boolean))];
  const uSel   = document.getElementById('filter-user');
  const uCur   = uSel.value;
  uSel.innerHTML = '<option value="">All Users</option>' +
    unames.map(u => `<option value="${u}"${u === uCur ? ' selected' : ''}>${u}</option>`).join('');

  // Filter logs
  const filtered = logs.filter(l => {
    const txt = `${l.flt} ${l.reg} ${l.dest} ${l.actype} ${l.loggedBy}`.toLowerCase();
    return (!q || txt.includes(q))
        && (!acf || l.actype === acf)
        && (!shf || l.shift === shf)
        && (!uf  || l.loggedBy === uf);
  });

  const canDelete = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';
  const tbody = document.getElementById('log-tbody');

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="padding:32px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--muted)">
          No records found.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(l => `
    <tr onclick="openDetail('${l.id}')">
      <td class="col-date">${l.date || '—'}</td>
      <td class="col-flt">${l.flt || '—'}</td>
      <td class="col-ac">${l.actype || '—'}</td>
      <td>${l.reg || '—'}</td>
      <td>${l.dest || '—'}</td>
      <td>${l.totArr}</td>
      <td>${l.totDep}</td>
      <td>${l.frtin ? l.frtin + ' kg' : '—'}</td>
      <td>Shift ${l.shift}</td>
      <td style="color:var(--muted);font-size:10px">${l.loggedByName || l.loggedBy || '—'}</td>
      <td><span class="badge badge-ok">OK</span></td>
      <td>
        ${canDelete
          ? `<button class="btn btn-danger" style="padding:3px 8px;font-size:9px"
               onclick="event.stopPropagation();deleteLog('${l.id}')">✕</button>`
          : ''}
      </td>
    </tr>
  `).join('');
}
