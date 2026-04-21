/**
 * GIA Aircraft Log System
 * auth.js — Authentication & session management
 */

let currentUser = null;
let sessionTimer = null;
let sessionSeconds = 30 * 60; // 30 minutes

/**
 * Attempt login with username, password, and role.
 * Validates against users array from data.js.
 */
function attemptLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  const role     = document.getElementById('login-role').value;
  const errEl    = document.getElementById('login-error');

  // Validation
  if (!username || !password || !role) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.classList.add('show');
    return;
  }

  const found = users.find(u =>
    u.username === username &&
    u.password === password &&
    u.role     === role &&
    u.active   === true
  );

  if (!found) {
    errEl.textContent = 'Invalid credentials or role mismatch.';
    errEl.classList.add('show');
    return;
  }

  errEl.classList.remove('show');
  currentUser = found;

  addAudit('User Login', `${found.name} signed in as ${found.role}`, 'login');

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-shell').style.display = 'block';

  applyRoleUI();
  startSessionTimer();
  renderDashboard();
  updateBadge();
  showToast(`▶ Welcome, ${found.name}`);
}

/**
 * Apply role-based UI restrictions after login.
 */
function applyRoleUI() {
  const role = currentUser.role;
  const colors = { admin: '#00c8ff', supervisor: '#ffb300', staff: '#00e57a' };
  const initials = currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  document.getElementById('header-avatar').style.background = colors[role] || '#888';
  document.getElementById('header-avatar').textContent = initials;
  document.getElementById('header-username').textContent = currentUser.name;
  document.getElementById('header-role').textContent = role.toUpperCase();

  // Admin-only: user management
  document.getElementById('nav-users').classList.toggle('hidden', role !== 'admin');

  // Staff cannot see audit trail
  document.getElementById('nav-audit').classList.toggle('hidden', role === 'staff');

  // Admin can clear audit trail
  document.getElementById('clear-audit-btn').style.display = role === 'admin' ? '' : 'none';
}

/**
 * Show logout confirmation and perform logout.
 */
function confirmLogout() {
  showConfirm(
    'Sign Out',
    'Are you sure you want to sign out of the system?',
    performLogout,
    'Sign Out'
  );
}

function performLogout() {
  addAudit('User Logout', `${currentUser.name} signed out`, 'logout');
  currentUser = null;
  clearInterval(sessionTimer);
  document.getElementById('session-warning').classList.remove('show');
  document.getElementById('app-shell').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-role').value = '';
}

/**
 * Start the 30-minute session timeout countdown.
 * Shows a warning at 5 minutes remaining.
 * Auto-logs out at 0.
 */
function startSessionTimer() {
  sessionSeconds = 30 * 60;
  clearInterval(sessionTimer);

  sessionTimer = setInterval(() => {
    sessionSeconds--;

    if (sessionSeconds <= 0) {
      clearInterval(sessionTimer);
      addAudit('Session Expired', `${currentUser.name}'s session timed out`, 'logout');
      currentUser = null;
      document.getElementById('session-warning').classList.remove('show');
      document.getElementById('app-shell').style.display = 'none';
      document.getElementById('login-screen').style.display = 'flex';
      showToast('⚠ Session expired. Please sign in again.', 'error');
      return;
    }

    if (sessionSeconds <= 300) {
      const m = Math.floor(sessionSeconds / 60);
      const s = sessionSeconds % 60;
      document.getElementById('session-countdown').textContent =
        `${m}:${s.toString().padStart(2, '0')}`;
      document.getElementById('session-warning').classList.add('show');
    } else {
      document.getElementById('session-warning').classList.remove('show');
    }
  }, 1000);
}

/**
 * Reset session timer on user activity.
 */
function resetSessionTimer() {
  if (currentUser) {
    sessionSeconds = 30 * 60;
    document.getElementById('session-warning').classList.remove('show');
  }
}

// Listen for user activity to reset session
document.addEventListener('click', resetSessionTimer);
document.addEventListener('keydown', resetSessionTimer);

// Allow Enter key on password field
document.getElementById('login-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') attemptLogin();
});
