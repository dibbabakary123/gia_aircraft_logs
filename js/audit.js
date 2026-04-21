/**
 * GIA Aircraft Log System
 * audit.js — Audit trail: logging and rendering
 */

/**
 * Add a record to the audit trail.
 * @param {string} action  - Short action label (e.g. 'Log Created')
 * @param {string} detail  - Detail string
 * @param {string} type    - Event type: create | delete | login | logout | update
 */
function addAudit(action, detail, type = 'create') {
  auditLog.unshift({
    ts:     new Date().toISOString(),
    user:   currentUser ? currentUser.username : 'system',
    name:   currentUser ? currentUser.name : 'System',
    action,
    detail,
    type
  });

  // Keep last 200 events
  if (auditLog.length > 200) auditLog = auditLog.slice(0, 200);
  saveAudit();
}

/**
 * Render the audit trail page.
 */
function renderAudit() {
  const typeClass = {
    create: 'ab-create',
    delete: 'ab-delete',
    login:  'ab-login',
    logout: 'ab-logout',
    update: 'ab-update'
  };

  const el = document.getElementById('audit-list');

  if (!auditLog.length) {
    el.innerHTML = '<div style="font-family:var(--mono);font-size:11px;color:var(--muted);padding:20px 0">No audit records found.</div>';
    return;
  }

  el.innerHTML = auditLog.map(a => `
    <div class="audit-entry">
      <div class="audit-time">${new Date(a.ts).toLocaleString()}</div>
      <div class="audit-user">${a.user}</div>
      <div class="audit-action">
        ${a.action}: ${a.detail}
        <span class="audit-badge ${typeClass[a.type] || ''}">${a.type.toUpperCase()}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Clear all audit records (Admin only).
 */
function clearAudit() {
  if (currentUser?.role !== 'admin') {
    showToast('⚠ Administrator access required', 'error');
    return;
  }
  showConfirm(
    'Clear Audit Trail',
    'This will permanently erase <b>all</b> audit records. This cannot be undone. Continue?',
    () => {
      auditLog = [];
      saveAudit();
      renderAudit();
      showToast('Audit trail cleared');
    }
  );
}
