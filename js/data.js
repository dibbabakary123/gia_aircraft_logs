/**
 * GIA Aircraft Log System
 * data.js — Data layer: localStorage persistence & seed data
 */

// ── Load from storage ──
let logs = JSON.parse(localStorage.getItem('gia-logs') || '[]');
let auditLog = JSON.parse(localStorage.getItem('gia-audit') || '[]');
let users = JSON.parse(localStorage.getItem('gia-users') || 'null');

// ── Seed default users if none exist ──
if (!users) {
  users = [
    {
      id: 'u1',
      name: 'System Administrator',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      active: true,
      created: '2024-01-01'
    },
    {
      id: 'u2',
      name: 'Flight Supervisor',
      username: 'supervisor',
      password: 'sup123',
      role: 'supervisor',
      active: true,
      created: '2024-01-01'
    },
    {
      id: 'u3',
      name: 'Ground Staff Officer',
      username: 'staff',
      password: 'staff123',
      role: 'staff',
      active: true,
      created: '2024-01-01'
    }
  ];
  saveUsers();
}

// ── Seed sample log entry from physical GIA document ──
if (!logs.length) {
  logs = [
    {
      id: 'LOG-001',
      actype: 'A330',
      reg: 'TC-LNG',
      flt: 'TK571',
      date: '2024-02-21',
      sta: '05:45',
      ata: '05:52',
      std: '07:15',
      atd: '07:17',
      sgt: 90,
      agt: 62,
      dest: 'IST',
      hcn: '54424',
      arrPax: [150, 56, 13, 3],
      depPax: [100, 80, 5, 64],
      trnPax: [20, 4, 1, 0],
      totArr: 222,
      totDep: 249,
      totTrn: 25,
      frtin: 1095,
      frtout: 0,
      trnfrt: 2220,
      mlsin: 1,
      mlsout: 1,
      trnmls: 'NIL',
      shift: 'B',
      remarks: '',
      loggedBy: 'admin',
      loggedByName: 'System Administrator',
      loggedByRole: 'admin',
      savedAt: '2024-02-21T07:30:00.000Z'
    }
  ];
  saveLogs();
}

// ── Persistence functions ──
function saveLogs() {
  localStorage.setItem('gia-logs', JSON.stringify(logs));
  updateBadge();
}

function saveUsers() {
  localStorage.setItem('gia-users', JSON.stringify(users));
}

function saveAudit() {
  localStorage.setItem('gia-audit', JSON.stringify(auditLog));
}

function updateBadge() {
  const el = document.getElementById('log-count-badge');
  if (el) el.textContent = logs.length;
}
