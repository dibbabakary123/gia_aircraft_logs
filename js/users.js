/**
 * GIA Aircraft Log System
 * users.js — User management (Admin only)
 */

const ROLE_COLORS  = { admin: '#00c8ff', supervisor: '#ffb300', staff: '#00e57a' };
const ROLE_LABELS  = { admin: 'Administrator', supervisor: 'Supervisor', staff: 'Ground Staff' };

// ── RENDER USERS PAGE ──
function renderUsers() {
  const el = document.getElementById('users-list');

  if (currentUser?.role !== 'admin') {
    el.innerHTML = `
      <div class="no-access">
        <div class="lock">🔒</div>
        <h3>ACCESS DENIED</h3>
        <p>Administrator privileges required to manage users.</p>
      </div>`;
    return;
  }

  el.innerHTML = users.map(u => `
    <div class="user-card">
      <div class="uc-avatar" style="background:${ROLE_COLORS[u.role] || '#888'}">
        ${u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div class="uc-info">
        <div class="uc-name">
          ${u.name}
          ${u.id === currentUser.id
            ? '<span style="font-size:10px;color:var(--accent);font-family:var(--mono)">(YOU)</span>'
            : ''}
        </div>
        <div class="uc-meta">
          ${u.username} · ${ROLE_LABELS[u.role]} ·
          ${u.active
            ? '<span style="color:var(--green)">ACTIVE</span>'
            : '<span style="color:var(--red)">INACTIVE</span>'}
          · Created: ${u.created}
        </div>
      </div>
      <div class="uc-actions">
        <button class="btn btn-amber" style="padding:5px 12px;font-size:10px"
          onclick="toggleUserActive('${u.id}')">
          ${u.active ? 'Disable' : 'Enable'}
        </button>
        ${u.id !== currentUser.id
          ? `<button class="btn btn-danger" style="padding:5px 12px;font-size:10px"
               onclick="confirmDeleteUser('${u.id}')">✕ Remove</button>`
          : ''}
      </div>
    </div>
  `).join('');
}

// ── ADD USER MODAL ──
function openAddUserModal() {
  document.getElementById('add-user-modal').classList.add('show');
}

function addUser() {
  const name  = document.getElementById('nu-name').value.trim();
  const uname = document.getElementById('nu-user').value.trim();
  const pass  = document.getElementById('nu-pass').value;
  const role  = document.getElementById('nu-role').value;

  if (!name || !uname || !pass) {
    showToast('⚠ All fields are required', 'error');
    return;
  }

  if (users.find(u => u.username === uname)) {
    showToast('⚠ Username already exists', 'error');
    return;
  }

  const newUser = {
    id:       'u' + Date.now(),
    name,
    username: uname,
    password: pass,
    role,
    active:   true,
    created:  new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  saveUsers();
  addAudit('User Created', `${name} (${uname}) as ${ROLE_LABELS[role]}`, 'create');
  closeModal('add-user-modal');
  renderUsers();
  renderDashboard();
  showToast('✓ User ' + uname + ' created');

  // Clear modal fields
  ['nu-name', 'nu-user', 'nu-pass'].forEach(id => document.getElementById(id).value = '');
}

// ── TOGGLE USER ACTIVE STATE ──
function toggleUserActive(id) {
  const u = users.find(x => x.id === id);
  if (!u) return;

  u.active = !u.active;
  saveUsers();
  addAudit(
    'User ' + (u.active ? 'Enabled' : 'Disabled'),
    `${u.name} (${u.username})`,
    'update'
  );
  renderUsers();
  renderDashboard();
  showToast(`User ${u.username} ${u.active ? 'enabled' : 'disabled'}`);
}

// ── DELETE USER ──
function confirmDeleteUser(id) {
  const u = users.find(x => x.id === id);
  showConfirm(
    'Remove User',
    `Remove user <b>${u?.name}</b> (${u?.username}) from the system?<br>This cannot be undone.`,
    () => {
      addAudit('User Removed', `${u?.name} (${u?.username})`, 'delete');
      users = users.filter(x => x.id !== id);
      saveUsers();
      renderUsers();
      renderDashboard();
      showToast('User removed');
    }
  );
}
