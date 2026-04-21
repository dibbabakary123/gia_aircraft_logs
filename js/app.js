/**
 * GIA Aircraft Log System
 * app.js — Application initialisation and event binding
 */

// ── DASHBOARD ──
function renderDashboard() {
  document.getElementById('stat-total').textContent = logs.length;
  document.getElementById('stat-pax').textContent   = logs.reduce((a, l) => a + l.totArr, 0);
  document.getElementById('stat-frt').textContent   = logs.reduce((a, l) => a + (l.frtin || 0), 0) + ' kg';
  document.getElementById('stat-users').textContent = users.filter(u => u.active).length;

  // Destination bar chart
  const destMap = {};
  logs.forEach(l => { destMap[l.dest] = (destMap[l.dest] || 0) + l.totArr; });
  const dests = Object.entries(destMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxV  = dests[0]?.[1] || 1;

  const chart = document.getElementById('dest-chart');
  chart.innerHTML = dests.length
    ? dests.map(([d, v]) => `
        <div class="mini-bar-row">
          <div class="mini-bar-label">${d || '—'}</div>
          <div class="mini-bar-track">
            <div class="mini-bar-fill" style="width:${(v / maxV * 100).toFixed(1)}%"></div>
          </div>
          <div class="mini-bar-val">${v}</div>
        </div>`).join('')
    : '<div class="empty-msg">No destination data yet.</div>';

  // Recent activity
  const rl = document.getElementById('recent-list');
  rl.innerHTML = logs.length
    ? logs.slice(0, 5).map(l => `
        <div class="recent-item" onclick="openDetail('${l.id}')">
          <div class="ri-flt">${l.flt || '—'}</div>
          <div class="ri-info">${l.actype || '—'} · ${l.dest || '—'} · ${l.totArr} arr</div>
          <div class="ri-date">${l.date || '—'}</div>
        </div>`).join('')
    : '<div class="empty-msg">No recent log entries.</div>';
}

// ── EVENT BINDINGS ──

// Login button
document.getElementById('btn-login').addEventListener('click', attemptLogin);

// Logout button
document.getElementById('btn-logout').addEventListener('click', confirmLogout);

// Sidebar navigation
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', () => showPage(item.dataset.page, item));
});

// New log — save & clear buttons
document.getElementById('btn-save-log').addEventListener('click', saveLog);
document.getElementById('btn-clear-form').addEventListener('click', resetForm);
document.getElementById('btn-reset-form').addEventListener('click', resetForm);

// Log list — search & filters
document.getElementById('search-input').addEventListener('input', renderLogTable);
document.getElementById('filter-ac').addEventListener('change', renderLogTable);
document.getElementById('filter-shift').addEventListener('change', renderLogTable);
document.getElementById('filter-user').addEventListener('change', renderLogTable);

// Detail panel close
document.getElementById('btn-close-detail').addEventListener('click', closeDetail);

// User management — add user
document.getElementById('btn-add-user').addEventListener('click', openAddUserModal);
document.getElementById('btn-create-user').addEventListener('click', addUser);

// Audit — clear button
document.getElementById('clear-audit-btn').addEventListener('click', clearAudit);

// ── INIT ──
updateBadge();
