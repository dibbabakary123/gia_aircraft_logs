/**
 * GIA Aircraft Log System
 * ui.js — UI helpers: navigation, toast, modals, clock, detail panel
 */

// ── CLOCK ──
function updateClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toUTCString().match(/\d\d:\d\d:\d\d/)[0] + ' UTC';
}
setInterval(updateClock, 1000);
updateClock();

// Set dashboard date
const dashDate = document.getElementById('dash-date');
if (dashDate) {
  dashDate.textContent = new Date()
    .toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    .toUpperCase();
}

// ── NAVIGATION ──
function showPage(id, el) {
  // Permission checks
  if (id === 'users' && currentUser?.role !== 'admin') {
    showToast('⚠ Administrator access required', 'error');
    return;
  }
  if (id === 'audit' && currentUser?.role === 'staff') {
    showToast('⚠ Access restricted', 'error');
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('page-' + id).classList.add('active');
  if (el) el.classList.add('active');

  closeDetail();

  // Render page-specific content
  if (id === 'log-list')   renderLogTable();
  if (id === 'dashboard')  renderDashboard();
  if (id === 'pax-report') renderPaxReport();
  if (id === 'frt-report') renderFrtReport();
  if (id === 'users')      renderUsers();
  if (id === 'audit')      renderAudit();
}

// ── DETAIL PANEL ──
function openDetail(id) {
  const l = logs.find(x => x.id === id);
  if (!l) return;

  document.getElementById('dp-flt').textContent = l.flt || '—';
  document.getElementById('dp-sub').textContent = `${l.date || ''} · ${l.actype || ''} · ${l.reg || ''}`;

  const canDel = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';

  document.getElementById('dp-body').innerHTML = `
    <div class="detail-section-title">Flight Info</div>
    ${dr('Log ID', l.id)}
    ${dr('A/C Type', l.actype)}
    ${dr('Registration', l.reg)}
    ${dr('Destination', l.dest)}
    ${dr('HCN', l.hcn)}
    ${dr('Shift', 'Shift ' + l.shift)}

    <div class="detail-section-title">Timings</div>
    ${dr('STA / ATA', `${l.sta} / ${l.ata}`)}
    ${dr('STD / ATD', `${l.std} / ${l.atd}`)}
    ${dr('SGT', l.sgt + ' min')}
    ${dr('AGT', l.agt + ' min')}

    <div class="detail-section-title">Passengers</div>
    ${dr('ARR PAX', l.totArr)}
    ${dr('DEP PAX', l.totDep)}
    ${dr('TRN PAX', l.totTrn)}

    <div class="detail-section-title">Freight & Meals</div>
    ${dr('FRT IN',  (l.frtin  || 0) + ' kg')}
    ${dr('FRT OUT', (l.frtout || 0) + ' kg')}
    ${dr('TRN FRT', (l.trnfrt || 0) + ' kg')}
    ${dr('MLS IN',  l.mlsin)}
    ${dr('MLS OUT', l.mlsout)}
    ${dr('TRN MLS', l.trnmls || 'NIL')}

    <div class="detail-section-title">Audit Info</div>
    ${dr('Logged By',  l.loggedByName || l.loggedBy || '—')}
    ${dr('Role',      (l.loggedByRole || '—').toUpperCase())}
    ${dr('Saved At',   l.savedAt ? new Date(l.savedAt).toLocaleString() : '—')}

    ${l.remarks
      ? `<div class="detail-section-title">Remarks</div>
         <div style="font-family:var(--mono);font-size:11px;color:var(--text);padding:8px 0">${l.remarks}</div>`
      : ''}

    ${canDel
      ? `<div style="margin-top:24px">
           <button class="btn btn-danger" onclick="deleteLog('${l.id}')">✕ Delete Entry</button>
         </div>`
      : ''}
  `;

  document.getElementById('detail-panel').classList.add('open');
}

function dr(k, v) {
  return `<div class="detail-row"><span class="dk">${k}</span><span class="dv">${v ?? '—'}</span></div>`;
}

function closeDetail() {
  document.getElementById('detail-panel').classList.remove('open');
}

// ── MODALS ──
function showConfirm(title, msg, onOk, okLabel = 'Confirm') {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').innerHTML = msg;
  const btn = document.getElementById('confirm-ok-btn');
  btn.textContent = okLabel;
  btn.onclick = () => {
    closeModal('confirm-modal');
    onOk();
  };
  document.getElementById('confirm-modal').classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

// Close modal buttons via data attribute
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
});

// ── TOAST ──
let toastTimer;
function showToast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type === 'error' ? ' error' : '');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}
