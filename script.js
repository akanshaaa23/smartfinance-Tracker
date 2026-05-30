/* ============================================================
   SmartFinance — Enhanced Script
   All existing functionality preserved + new features added
   ============================================================ */

const API_BASE_URL = '/api/tx';

// ============================================================
// TOAST NOTIFICATION SYSTEM (replaces alert())
// ============================================================
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
// LOADING STATE
// ============================================================
function setLoading(state) {
  document.getElementById('loadingOverlay').classList.toggle('hidden', !state);
}

// ============================================================
// DOM REFERENCES
// ============================================================
const landing = document.getElementById('landing');
const gotoAppBtn = document.getElementById('gotoAppBtn');
const startBtn = document.getElementById('startBtn');
const previewBtn = document.getElementById('previewBtn');

const app = document.getElementById('app');
const loginBtn = document.getElementById('login');
const usernameI = document.getElementById('username');
const logoutBtn = document.getElementById('logout');
const currencySel = document.getElementById('currencySel');

const openAddDesktopBtn = document.getElementById('openAdd');
const openAddMobileBtn = document.getElementById('openAddMobile');
const sampleBtn = document.getElementById('sample');
const backupBtn = document.getElementById('backup');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const exportCSVBtn = document.getElementById('exportCSV');
const setBudgetBtn = document.getElementById('setBudget');

const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expensesEl = document.getElementById('expenses');
const alertsEl = document.getElementById('alerts');
const recListEl = document.getElementById('recList');
const recCountEl = document.getElementById('recCount');
const txCountEl = document.getElementById('txCount');

const searchI = document.getElementById('search');
const fromI = document.getElementById('from');
const toI = document.getElementById('to');
const catFilter = document.getElementById('catFilter');
const typeFilter = document.getElementById('typeFilter');
const applyBtn = document.getElementById('apply');
const clearBtn = document.getElementById('clear');

const txTableBody = document.getElementById('txTableBody');
const emptyState = document.getElementById('emptyState');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const txForm = document.getElementById('txForm');
const m_date = document.getElementById('m_date');
const m_desc = document.getElementById('m_desc');
const m_amount = document.getElementById('m_amount');
const m_type = document.getElementById('m_type');
const m_category = document.getElementById('m_category');
const m_rec = document.getElementById('m_rec');
const cancelBtn = document.getElementById('cancel');
const cancelXBtn = document.getElementById('cancelX');
const saveBtn = document.getElementById('saveBtn');

// ============================================================
// STATE
// ============================================================
let currentUser = null;
let currentTransactions = [];
let currentRecs = [];
let currentBudget = null;
let currentCurrency = 'INR';
let editingId = null;

// ============================================================
// CHARTS
// ============================================================
Chart.defaults.color = '#9aacca';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';

const catCtx = document.getElementById('catChart').getContext('2d');
const monthCtx = document.getElementById('monthChart').getContext('2d');

const catChartColors = [
  '#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#ec4899'
];

let catChart = new Chart(catCtx, {
  type: 'doughnut',
  data: { labels: [], datasets: [{ data: [], backgroundColor: catChartColors, borderWidth: 2, borderColor: '#1a2240' }] },
  options: {
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 14, font: { size: 12 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${formatAmt(ctx.parsed)}` } }
    }
  }
});

let monthChart = new Chart(monthCtx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      { label: 'Income', data: [], backgroundColor: 'rgba(16,185,129,0.7)', borderColor: 'rgba(16,185,129,0.9)', borderWidth: 1, borderRadius: 4 },
      { label: 'Expense', data: [], backgroundColor: 'rgba(239,68,68,0.65)', borderColor: 'rgba(239,68,68,0.9)', borderWidth: 1, borderRadius: 4 }
    ]
  },
  options: {
    scales: {
      y: { beginAtZero: true, ticks: { callback: v => formatAmt(v) } },
      x: { ticks: { font: { size: 11 } } }
    },
    plugins: {
      legend: { position: 'bottom', labels: { padding: 14, font: { size: 12 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatAmt(ctx.parsed.y)}` } }
    }
  }
});

// ============================================================
// CATEGORY METADATA
// ============================================================
const catMeta = {
  food:          { icon: '🍔', cls: 'cat-food' },
  transport:     { icon: '🚌', cls: 'cat-transport' },
  salary:        { icon: '💼', cls: 'cat-salary' },
  entertainment: { icon: '🎬', cls: 'cat-entertainment' },
  utilities:     { icon: '💡', cls: 'cat-utilities' },
  health:        { icon: '🏥', cls: 'cat-health' },
  general:       { icon: '📦', cls: 'cat-general' },
};
function getCat(cat) {
  return catMeta[cat] || catMeta['general'];
}

// ============================================================
// HELPERS
// ============================================================
function formatAmt(v) {
  const num = Number(v || 0).toFixed(2);
  if (currentCurrency === 'USD') return `$${Number(num).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  if (currentCurrency === 'EUR') return `€${Number(num).toLocaleString('en-DE', { minimumFractionDigits: 2 })}`;
  if (currentCurrency === 'GBP') return `£${Number(num).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  return `₹${Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${day}, ${y}`;
}

// ============================================================
// BACKEND API FUNCTIONS
// ============================================================
// ── localStorage helpers ──────────────────────────────────────
function localKey(user)     { return `smartfin_txs_${user}`; }
function localSettingsKey(u){ return `smartfin_settings_${u}`; }

function saveLocalTxs(user, txs) {
  try { localStorage.setItem(localKey(user), JSON.stringify(txs)); } catch(e) {}
}
function getLocalTxs(user) {
  try { return JSON.parse(localStorage.getItem(localKey(user)) || '[]'); } catch(e) { return []; }
}
function makeTempId() {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
}
// ─────────────────────────────────────────────────────────────

async function loadTransactions(user) {
  if (!user) return;
  currentUser = user;
  setLoading(true);

  const localSettings = JSON.parse(localStorage.getItem(localSettingsKey(user)) || '{}');
  currentBudget   = localSettings.budget   || null;
  currentCurrency = localSettings.currency || 'INR';
  currencySel.value = currentCurrency;

  // Always load local data immediately so UI is never blank
  const localTxs = getLocalTxs(user);
  if (localTxs.length) {
    currentTransactions = localTxs;
    currentRecs = localTxs.filter(t => t.recurring);
    renderAll();
  }

  // Then try backend — silently merge if available
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${API_BASE_URL}/${user}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error('Server error ' + response.status);
    const serverTxs = await response.json();
    if (serverTxs.length > 0 || localTxs.length === 0) {
      // Merge: keep local-only entries (temp IDs) + all server entries
      const serverIds = new Set(serverTxs.map(t => t._id));
      const localOnly = localTxs.filter(t => t._id && t._id.startsWith('local_'));
      const merged = [...serverTxs, ...localOnly];
      currentTransactions = merged;
      currentRecs = merged.filter(t => t.recurring);
      saveLocalTxs(user, merged);
      renderAll();
    }
  } catch (error) {
    if (localTxs.length === 0) {
      showToast('Server not connected — working in offline mode.', 'warning', 5000);
    } else {
      showToast('Offline mode: data loaded from  local .', 'info', 3000);
    }
    console.warn('Backend unavailable, using localStorage:', error.message);
  } finally {
    setLoading(false);
  }
}

function saveClientSettings() {
  if (!currentUser) return;
  localStorage.setItem(localSettingsKey(currentUser), JSON.stringify({
    budget: currentBudget,
    currency: currentCurrency
  }));
}

async function addOrUpdateTransaction(tx) {
  try {
    // ── Optimistic local update first ──
    if (tx._id && !tx._id.startsWith('local_')) {
      // Editing a server-backed transaction
      currentTransactions = currentTransactions.map(t => t._id === tx._id ? { ...t, ...tx } : t);
    } else if (tx._id && tx._id.startsWith('local_')) {
      // Editing a local-only transaction
      currentTransactions = currentTransactions.map(t => t._id === tx._id ? { ...t, ...tx } : t);
    } else {
      // New transaction — give it a temp local ID immediately
      const tempTx = { ...tx, _id: makeTempId(), username: currentUser };
      currentTransactions = [tempTx, ...currentTransactions];
    }
    currentRecs = currentTransactions.filter(t => t.recurring);
    saveLocalTxs(currentUser, currentTransactions);
    closeModal();
    showToast(tx._id ? 'Transaction updated !' : 'Transaction added !', 'success');
    renderAll();

    // ── Then try syncing to backend in background ──
    let response;
    if (tx._id && !tx._id.startsWith('local_')) {
      response = await fetch(`${API_BASE_URL}/${tx._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });
    } else {
      const { _id, ...txBody } = tx._id ? tx : { ...tx };
      response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...txBody, username: currentUser })
      });
    }
    if (response && response.ok) {
      const saved = await response.json();
      // Replace temp ID with real server ID if new
      if (!tx._id || tx._id.startsWith('local_')) {
        currentTransactions = currentTransactions.map(t =>
          (t._id === tx._id || (!tx._id && t.desc === saved.desc && t.amount === saved.amount))
            ? saved : t
        );
        currentRecs = currentTransactions.filter(t => t.recurring);
        saveLocalTxs(currentUser, currentTransactions);
      }
    }
  } catch (error) {
    console.warn('Backend sync failed, saved locally:', error.message);
  }
}

async function deleteTransaction(id) {
  // Optimistic local delete
  currentTransactions = currentTransactions.filter(t => t._id !== id);
  currentRecs = currentTransactions.filter(t => t.recurring);
  saveLocalTxs(currentUser, currentTransactions);
  renderAll();
  showToast('Transaction deleted .', 'info');

  // Sync to backend if real ID
  if (id && !id.startsWith('local_')) {
    try {
      await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete backend sync failed:', e.message);
    }
  }
}

// ============================================================
// LANDING PAGE ACTIONS
// ============================================================
gotoAppBtn.onclick = () => { landing.classList.add('hidden'); app.classList.remove('hidden'); };
startBtn.onclick = () => { landing.classList.add('hidden'); app.classList.remove('hidden'); };
previewBtn.onclick = () => startDemo();

// ============================================================
// AUTH
// ============================================================
async function handleLogin() {
  const u = usernameI.value.trim();
  if (!u) { showToast('Please enter a username.', 'warning'); return; }
  localStorage.setItem('smartfin_last_user', u);
  await loadTransactions(u);
  app.classList.remove('hidden');
  landing.classList.add('hidden');
  // Update UI for logged-in state
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('userSection').classList.remove('hidden');
  document.getElementById('userNameDisplay').textContent = u;
  document.getElementById('userAvatar').textContent = u.charAt(0).toUpperCase();
  openAddDesktopBtn.style.display = 'flex';
}

loginBtn.onclick = handleLogin;
usernameI.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

logoutBtn.onclick = () => {
  currentUser = null;
  currentTransactions = [];
  currentRecs = [];
  currentBudget = null;
  currentCurrency = 'INR';
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('userSection').classList.add('hidden');
  openAddDesktopBtn.style.display = 'none';
  app.classList.add('hidden');
  landing.classList.remove('hidden');
  usernameI.value = '';
  renderAll();
  showToast('Signed out successfully.', 'info');
};

// ============================================================
// MODAL
// ============================================================
function openModal(tx) {
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if (tx) {
    modalTitle.textContent = 'Edit Transaction';
    editingId = tx._id;
    m_date.value = tx.date;
    m_desc.value = tx.desc;
    m_amount.value = tx.amount;
    m_type.value = tx.type;
    m_category.value = tx.category;
    m_rec.checked = !!tx.recurring;
    saveBtn.textContent = 'Update Transaction';
  } else {
    modalTitle.textContent = 'Add Transaction';
    editingId = null;
    m_date.value = new Date().toISOString().slice(0, 10);
    m_desc.value = '';
    m_amount.value = '';
    m_type.value = 'expense';
    m_category.value = 'general';
    m_rec.checked = false;
    saveBtn.textContent = 'Save Transaction';
  }
  m_desc.focus();
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  editingId = null;
  txForm.reset();
}

openAdd.onclick = () => { if (currentUser) openModal(); else showToast('Please log in first.', 'warning'); };
openAddMobileBtn.onclick = () => { if (currentUser) openModal(); else showToast('Please log in first.', 'warning'); };
cancelBtn.onclick = closeModal;
cancelXBtn.onclick = closeModal;
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

txForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser) { showToast('Please log in first.', 'warning'); return; }
  const tx = {
    date: m_date.value,
    desc: m_desc.value || '—',
    amount: Number(m_amount.value) || 0,
    type: m_type.value,
    category: m_category.value,
    recurring: m_rec.checked || false
  };
  if (editingId) tx._id = editingId;
  saveBtn.textContent = 'Saving…';
  saveBtn.disabled = true;
  await addOrUpdateTransaction(tx);
  saveBtn.disabled = false;
});

// ============================================================
// TABLE EVENT DELEGATION
// ============================================================
txTableBody.addEventListener('click', async e => {
  const target = e.target.closest('[data-id]');
  if (!target) return;
  const id = target.dataset.id;
  if (target.classList.contains('btn-data-del')) {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  }
  if (target.classList.contains('btn-data-edit')) {
    const txToEdit = currentTransactions.find(tx => tx._id === id);
    if (txToEdit) openModal(txToEdit);
  }
});

// ============================================================
// SAMPLE DATA
// ============================================================
sampleBtn.onclick = async () => {
  if (!currentUser) { showToast('login first.', 'warning'); return; }
  setLoading(true);
  const today = new Date().toISOString().slice(0, 10);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10);
  const sampleTxs = [
    { date: today,      desc: 'Salary',           amount: 50000,   type: 'income',  category: 'salary',        recurring: true  },
    { date: today,      desc: 'Groceries',         amount: 1250.75, type: 'expense', category: 'food',          recurring: false },
    { date: today,      desc: 'Bus Pass',           amount: 40,      type: 'expense', category: 'transport',     recurring: false },
    { date: today,      desc: 'Netflix',            amount: 499,     type: 'expense', category: 'entertainment', recurring: true  },
    { date: today,      desc: 'Electricity Bill',  amount: 850,     type: 'expense', category: 'utilities',     recurring: true  },
    { date: lastMonth,  desc: 'Salary',            amount: 50000,   type: 'income',  category: 'salary',        recurring: false },
    { date: lastMonth,  desc: 'Restaurant',        amount: 650,     type: 'expense', category: 'food',          recurring: false },
    { date: lastMonth,  desc: 'Gym Membership',    amount: 1200,    type: 'expense', category: 'health',        recurring: true  },
  ];

  // Add locally immediately (with temp IDs)
  const newTxs = sampleTxs.map(t => ({ ...t, _id: makeTempId(), username: currentUser }));
  currentTransactions = [...newTxs, ...currentTransactions];
  currentRecs = currentTransactions.filter(t => t.recurring);
  saveLocalTxs(currentUser, currentTransactions);
  renderAll();
  setLoading(false);
  showToast('Sample data add ho gaya!', 'success');

  // Background sync to backend
  for (const t of sampleTxs) {
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...t, username: currentUser })
      });
      if (res.ok) {
        const saved = await res.json();
        // Replace matching temp entry with real server ID
        currentTransactions = currentTransactions.map(tx =>
          (tx._id.startsWith('local_') && tx.desc === t.desc && tx.date === t.date) ? saved : tx
        );
      }
    } catch(e) { /* offline — local copy stays */ }
  }
  saveLocalTxs(currentUser, currentTransactions);
};


// ============================================================
// BACKUP / IMPORT
// ============================================================
backupBtn.onclick = () => {
  if (!currentUser) { showToast('Please log in first.', 'warning'); return; }
  const data = {
    exported: new Date().toISOString(),
    username: currentUser,
    txs: currentTransactions,
    budget: currentBudget,
    currency: currentCurrency
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${currentUser}_smartfin_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Backup downloaded!', 'success');
};

importBtn.onclick = () => importFile.click();
importFile.onchange = async e => {
  const f = e.target.files[0];
  if (!f) return;
  if (!currentUser) { showToast('Please log in first.', 'warning'); return; }
  const r = new FileReader();
  r.onload = async () => {
    try {
      const parsed = JSON.parse(r.result);
      if (parsed.txs) {
        setLoading(true);
        // Add locally immediately
        const imported = parsed.txs.map(tx => ({ ...tx, _id: tx._id || makeTempId(), username: currentUser }));
        currentTransactions = [...imported, ...currentTransactions];
        currentRecs = currentTransactions.filter(t => t.recurring);
        if (parsed.budget) currentBudget = parsed.budget;
        if (parsed.currency) currentCurrency = parsed.currency;
        saveClientSettings();
        saveLocalTxs(currentUser, currentTransactions);
        renderAll();
        setLoading(false);
        showToast(`${parsed.txs.length} transactions import ho gayi!`, 'success');
        // Background backend sync
        for (const tx of parsed.txs) {
          try {
            const { _id, ...body } = tx;
            await fetch(API_BASE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, username: currentUser }) });
          } catch(e) {}
        }
      } else {
        showToast('no transaction in file.', 'warning');
      }
    } catch (err) {
      console.error('Import error:', err);
      showToast('Invalid file format.', 'error');
    }
    importFile.value = '';
  };
  r.readAsText(f);
};

// ============================================================
// EXPORT CSV
// ============================================================
exportCSVBtn.onclick = () => {
  if (!currentUser) { showToast('Please log in first.', 'warning'); return; }
  const filtered = applyFiltersTo(currentTransactions);
  if (!filtered.length) { showToast('No transactions to export.', 'warning'); return; }
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Recurring'];
  const rows = filtered.map(t => [
    t.date, `"${escapeHtml(t.desc)}"`, t.category, t.type, t.amount, t.recurring ? 'Yes' : 'No'
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${currentUser}_transactions_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('CSV exported!', 'success');
};

// ============================================================
// BUDGET
// ============================================================
setBudgetBtn.onclick = () => {
  const v = Number(document.getElementById('budget').value);
  if (!v) {
    currentBudget = null;
    showToast('Budget cleared.', 'info');
  } else {
    currentBudget = v;
    showToast(`Budget set to ${formatAmt(v)}.`, 'success');
  }
  saveClientSettings();
  renderAll();
};

// ============================================================
// FILTERS
// ============================================================
applyBtn.onclick = () => renderAll();
clearBtn.onclick = () => {
  searchI.value = '';
  fromI.value = '';
  toI.value = '';
  catFilter.value = 'all';
  typeFilter.value = 'all';
  renderAll();
};

// Real-time search
searchI.addEventListener('input', () => renderTable(applyFiltersTo(currentTransactions)));

function applyFiltersTo(txs) {
  const q = (searchI.value || '').trim().toLowerCase();
  const from = fromI.value;
  const to = toI.value;
  const cat = catFilter.value;
  const type = typeFilter.value;
  return txs.filter(t => {
    if (q && !(t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))) return false;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (cat && cat !== 'all' && t.category !== cat) return false;
    if (type && type !== 'all' && t.type !== type) return false;
    return true;
  });
}

// ============================================================
// RENDER TABLE
// ============================================================
function renderTable(list) {
  txTableBody.innerHTML = '';
  const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));

  if (!sorted.length) {
    emptyState.classList.remove('hidden');
    txCountEl.textContent = '0 entries';
  } else {
    emptyState.classList.add('hidden');
    txCountEl.textContent = `${sorted.length} ${sorted.length === 1 ? 'entry' : 'entries'}`;
  }

  sorted.forEach(t => {
    const cm = getCat(t.category);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(t.date)}</td>
      <td class="tx-desc">${escapeHtml(t.desc)}${t.recurring ? ' <span class="badge badge-rec">🔁</span>' : ''}</td>
      <td><span class="tx-category ${cm.cls}">${cm.icon} ${t.category}</span></td>
      <td><span class="tx-type ${t.type}">${t.type === 'income' ? '↑' : '↓'} ${t.type}</span></td>
      <td class="tx-amount ${t.type === 'income' ? 't-income' : 't-expense'}">${t.type === 'income' ? '+' : '−'}${formatAmt(t.amount)}</td>
      <td>
        <div class="tx-actions">
          <button class="btn-data-edit" data-id="${t._id}" title="Edit">✏️</button>
          <button class="btn-data-del" data-id="${t._id}" title="Delete">🗑️</button>
        </div>
      </td>`;
    txTableBody.appendChild(tr);
  });
}

// ============================================================
// RENDER CHARTS
// ============================================================
function renderCharts() {
  // Category pie
  const cmap = {};
  currentTransactions.filter(t => t.type === 'expense').forEach(t => {
    cmap[t.category] = (cmap[t.category] || 0) + Number(t.amount);
  });
  const clabels = Object.keys(cmap);
  const cdata = Object.values(cmap);
  catChart.data.labels = clabels.length ? clabels : ['No data'];
  catChart.data.datasets[0].data = cdata.length ? cdata : [1];
  catChart.update();

  // Monthly bar
  const now = new Date();
  const months = [];
  const inc = {}, exp = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear().toString().slice(2);
    months.push({ key, label });
    inc[key] = 0; exp[key] = 0;
  }
  currentTransactions.forEach(t => {
    const mm = t.date.slice(0, 7);
    const m = months.find(m => m.key === mm);
    if (!m) return;
    if (t.type === 'income') inc[mm] += Number(t.amount);
    else exp[mm] += Number(t.amount);
  });
  monthChart.data.labels = months.map(m => m.label);
  monthChart.data.datasets[0].data = months.map(m => inc[m.key]);
  monthChart.data.datasets[1].data = months.map(m => exp[m.key]);
  monthChart.update();
}

// ============================================================
// RENDER RECURRING LIST
// ============================================================
function renderRecurring() {
  recListEl.innerHTML = '';
  recCountEl.textContent = currentRecs.length;
  if (!currentRecs.length) {
    recListEl.innerHTML = '<div class="empty-state" style="padding:14px 8px"><div class="empty-desc">No recurring transactions yet.</div></div>';
    return;
  }
  const unique = [];
  const seen = new Set();
  currentRecs.forEach(r => {
    const key = `${r.desc}:${r.category}:${r.type}`;
    if (!seen.has(key)) { seen.add(key); unique.push(r); }
  });
  unique.forEach(r => {
    const cm = getCat(r.category);
    const div = document.createElement('div');
    div.className = 'rec-item';
    div.innerHTML = `
      <div class="rec-item-left">
        <div class="rec-item-desc">${cm.icon} ${escapeHtml(r.desc)}</div>
        <div class="rec-item-meta">${r.category} · ${r.type}</div>
      </div>
      <div class="rec-item-amount ${r.type === 'income' ? 't-income' : 't-expense'}">${formatAmt(r.amount)}</div>`;
    recListEl.appendChild(div);
  });
}

// ============================================================
// CHECK ALERTS & BUDGET PROGRESS
// ============================================================
function checkAlerts() {
  const monthKey = new Date().toISOString().slice(0, 7);
  const monthExpenses = currentTransactions
    .filter(t => t.type === 'expense' && t.date.slice(0, 7) === monthKey)
    .reduce((s, t) => s + Number(t.amount), 0);
  const monthIncome = currentTransactions
    .filter(t => t.type === 'income' && t.date.slice(0, 7) === monthKey)
    .reduce((s, t) => s + Number(t.amount), 0);

  // Budget progress bar
  const prog = document.getElementById('budgetProgress');
  const fill = document.getElementById('budgetBarFill');
  const spentLbl = document.getElementById('budgetSpentLabel');
  const limitLbl = document.getElementById('budgetLimitLabel');

  if (currentBudget && currentBudget > 0) {
    prog.classList.add('visible');
    const pct = Math.min((monthExpenses / currentBudget) * 100, 100);
    fill.style.width = pct + '%';
    fill.className = 'budget-bar-fill' + (pct >= 100 ? ' over' : pct >= 80 ? ' warn' : '');
    spentLbl.textContent = `Spent: ${formatAmt(monthExpenses)}`;
    limitLbl.textContent = `Budget: ${formatAmt(currentBudget)}`;
  } else {
    prog.classList.remove('visible');
  }

  alertsEl.innerHTML = '';

  if (currentBudget && monthExpenses > currentBudget) {
    alertsEl.innerHTML = `<div class="alert-box danger"><span class="alert-icon">🚨</span><div class="alert-text"><div class="at-title">Budget Exceeded!</div><div class="at-desc">You've spent ${formatAmt(monthExpenses)} of ${formatAmt(currentBudget)} this month.</div></div></div>`;
  } else if (currentBudget && monthExpenses >= currentBudget * 0.8) {
    const rem = currentBudget - monthExpenses;
    alertsEl.innerHTML = `<div class="alert-box warning"><span class="alert-icon">⚠️</span><div class="alert-text"><div class="at-title">Near Budget Limit</div><div class="at-desc">${formatAmt(rem)} remaining of ${formatAmt(currentBudget)} budget.</div></div></div>`;
  } else if (monthIncome > 0) {
    alertsEl.innerHTML = `<div class="alert-box success"><span class="alert-icon">✅</span><div class="alert-text"><div class="at-title">On Track</div><div class="at-desc">Saved ${formatAmt(monthIncome - monthExpenses)} this month.</div></div></div>`;
  } else {
    alertsEl.innerHTML = `<div class="alert-box info"><span class="alert-icon">ℹ️</span><div class="alert-text"><div class="at-desc">No alerts. Add transactions to get insights.</div></div></div>`;
  }
}

// ============================================================
// RECURRING PROCESSING
// ============================================================
async function processRecurring() {
  if (!currentUser) return;
  const thisMonth = new Date().toISOString().slice(0, 7);
  let added = false;
  const toSync = [];
  for (const r of currentRecs) {
    const exists = currentTransactions.some(t => t.desc === r.desc && t.category === r.category && t.date.slice(0, 7) === thisMonth);
    if (!exists) {
      const newTx = { _id: makeTempId(), date: new Date().toISOString().slice(0, 10), desc: r.desc, amount: r.amount, type: r.type, category: r.category, recurring: true, username: currentUser };
      currentTransactions = [newTx, ...currentTransactions];
      toSync.push(newTx);
      added = true;
    }
  }
  if (added) {
    currentRecs = currentTransactions.filter(t => t.recurring);
    saveLocalTxs(currentUser, currentTransactions);
    // Background sync
    for (const tx of toSync) {
      try {
        const { _id, ...body } = tx;
        const res = await fetch(API_BASE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
          const saved = await res.json();
          currentTransactions = currentTransactions.map(t => t._id === tx._id ? saved : t);
        }
      } catch(e) {}
    }
    saveLocalTxs(currentUser, currentTransactions);
  }
}

// ============================================================
// RENDER ALL
// ============================================================
async function renderAll() {
  if (!currentUser) {
    balanceEl.textContent = formatAmt(0);
    incomeEl.textContent = formatAmt(0);
    expensesEl.textContent = formatAmt(0);
    txTableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    txCountEl.textContent = '0 entries';
    recListEl.innerHTML = '<div class="empty-state" style="padding:14px 8px"><div class="empty-desc">No recurring transactions yet.</div></div>';
    alertsEl.innerHTML = '';
    recCountEl.textContent = '0';
    catChart.data.labels = ['No data']; catChart.data.datasets[0].data = [1]; catChart.update();
    monthChart.data.labels = []; monthChart.data.datasets[0].data = []; monthChart.data.datasets[1].data = []; monthChart.update();
    return;
  }

  currentCurrency = currencySel.value || currentCurrency || 'INR';
  saveClientSettings();

  await processRecurring();

  const totalIncome = currentTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExp = currentTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExp;

  balanceEl.textContent = formatAmt(balance);
  balanceEl.className = 'stat-value ' + (balance >= 0 ? 'positive' : 'negative');
  incomeEl.textContent = formatAmt(totalIncome);
  expensesEl.textContent = formatAmt(totalExp);

  renderTable(applyFiltersTo(currentTransactions));
  renderCharts();
  renderRecurring();
  checkAlerts();
}

// ============================================================
// INIT
// ============================================================
(function init() {
  currencySel.onchange = () => {
    if (currentUser) { currentCurrency = currencySel.value; saveClientSettings(); renderAll(); }
  };

  setInterval(() => { if (currentUser) processRecurring(); }, 30_000);

  const lastUser = localStorage.getItem('smartfin_last_user');
  if (lastUser) usernameI.value = lastUser;

  // Pre-render empty state
  renderAll();
})();

// expose for console debugging
window.openModal = openModal;

// ============================================================
// PERFORMANCE FIX: debounced renderAll to avoid redundant redraws
// ============================================================
let _renderTimer = null;
const _origRenderAll = renderAll;
window.renderAllDebounced = function(delay = 80) {
  clearTimeout(_renderTimer);
  _renderTimer = setTimeout(() => _origRenderAll(), delay);
};

// ============================================================
// PERFORMANCE FIX: chart lazy update — skip if data unchanged
// ============================================================
let _lastCatHash = '', _lastMonthHash = '';
const _origRenderCharts = renderCharts;
window.renderCharts = function() {
  const catHash = JSON.stringify(
    currentTransactions.filter(t => t.type === 'expense').map(t => t.category + t.amount)
  );
  const monthHash = currentTransactions.map(t => t.date + t.amount + t.type).join('|');
  if (catHash === _lastCatHash && monthHash === _lastMonthHash) return;
  _lastCatHash = catHash;
  _lastMonthHash = monthHash;
  _origRenderCharts();
};

// ============================================================
// INTERACTIVE DEMO TOUR
// ============================================================
const DEMO_STEPS = [
  {
    icon: '👋',
    title: 'welcome to smartfinance',
    desc: 'This is a short guided tour that will help you learn how to use the app. In just 7 simple steps, you will  understand all the main features and get started quickly. 🚀',
    target: null,
    position: 'center'
  },
  {
    icon: '🔐',
    title: 'Step 1: Login first',
    desc: 'On the left side, enter your username in the "Sign In" box (any name, such as "Akansha") and click the Login button. No password is required! 🔐✨',
    target: '#authSection',
    position: 'right'
  },
  {
    icon: '🎲',
    title: 'Step 2: load Sample data ',
    desc: 'click "Sample Data" button  —This will automatically add a few sample transactions so you can explore the charts, balance, and other features. You can also add your own transactions anytime! 📊💰',
    target: '#sample',
    position: 'right'
  },
  {
    icon: '➕',
    title: 'Step 3: add Transaction ',
    desc: '"+ Add" button dabao — A form will open where you can enter the date, description, amount, transaction type (Income/Expense), and category. Click "Save," and your transaction will be added instantly! ✅💰',
    target: '#openAddMobile',
    position: 'right'
  },
  {
    icon: '💰',
    title: 'Step 4:  see Summary ',
    desc: 'Here, you can view your Net Balance, Total Income, and Total Expenses. Everything is calculated automatically, so there is nothing you need to do! 📊💰✨',
    target: '.summary-cards',
    position: 'right'
  },
  {
    icon: '🎯',
    title: 'Step 5: set  Budget ',
    desc: 'Enter your spending limit in the "Monthly Budget" field (for example, 20,000) and click "Set." If your expenses reach 80% of the budget, you will receive a warning notification! ⚠️💸📈',
    target: '.budget-section',
    position: 'right'
  },
  {
    icon: '🔍',
    title: 'Step 6: Filter and then search ',
    desc: 'Use the search box at the top to find specific transactions, apply category or type filters, or set a date range. The results update instantly, making it easy to find exactly what you are looking for! 🔍⚡📅',
    target: '.filter-card',
    position: 'bottom'
  },
  {
    icon: '🎉',
    title: 'Tour complete!',
    desc: 'Congratulations! You are now a SmartFinance expert. 🎉 Explore advanced features like CSV export, JSON backup, and multi-currency support to get even more out of the app. Happy expense tracking and financial planning! 💰📊🚀',
    target: null,
    position: 'center'
  }
];

let demoStep = 0;
let demoRunning = false;

function startDemo() {
  // Go to app page first so we can highlight elements
  landing.classList.add('hidden');
  app.classList.remove('hidden');
  demoStep = 0;
  demoRunning = true;
  document.getElementById('demoOverlay').classList.remove('hidden');
  renderDemoStep();
}

function endDemo() {
  document.getElementById('demoOverlay').classList.add('hidden');
  document.getElementById('demoHighlight').className = 'demo-highlight';
  demoRunning = false;
}

function renderDemoStep() {
  const step = DEMO_STEPS[demoStep];
  const total = DEMO_STEPS.length;
  const tooltip = document.getElementById('demoTooltip');
  const highlight = document.getElementById('demoHighlight');

  // Update text
  document.getElementById('demoStepBadge').textContent =
    demoStep === 0 || demoStep === total - 1 ? 'SmartFinance Tour' : `Step ${demoStep} of ${total - 2}`;
  document.getElementById('demoIcon').textContent = step.icon;
  document.getElementById('demoTitle').textContent = step.title;
  document.getElementById('demoDesc').textContent = step.desc;

  // Prev button
  const prevBtn = document.getElementById('demoPrev');
  demoStep === 0 ? prevBtn.classList.add('hidden') : prevBtn.classList.remove('hidden');

  // Next button
  const nextBtn = document.getElementById('demoNext');
  if (demoStep === total - 1) {
    nextBtn.textContent = '✓ Shuru karo!';
    nextBtn.className = 'demo-btn-next finish-btn';
  } else {
    nextBtn.textContent = 'Next →';
    nextBtn.className = 'demo-btn-next';
  }

  // Dots
  const dotsEl = document.getElementById('demoDots');
  dotsEl.innerHTML = '';
  DEMO_STEPS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'demo-dot' + (i === demoStep ? ' active' : '');
    dotsEl.appendChild(d);
  });

  // Highlight target element
  if (step.target) {
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => positionTooltipNearEl(el, step.position, tooltip, highlight), 300);
    } else {
      centerTooltip(tooltip);
      highlight.className = 'demo-highlight';
      highlight.style.cssText = 'width:0;height:0;opacity:0';
    }
  } else {
    centerTooltip(tooltip);
    highlight.className = 'demo-highlight';
    highlight.style.cssText = 'width:0;height:0;opacity:0';
  }
}

function positionTooltipNearEl(el, position, tooltip, highlight) {
  const rect = el.getBoundingClientRect();
  const pad = 12;

  // Position highlight over element
  highlight.style.cssText = `
    left: ${rect.left - pad}px;
    top: ${rect.top - pad}px;
    width: ${rect.width + pad*2}px;
    height: ${rect.height + pad*2}px;
    opacity: 1;
  `;
  highlight.className = 'demo-highlight pulse';

  // Position tooltip
  const tw = 320, th = 240;
  const vw = window.innerWidth, vh = window.innerHeight;
  let left, top;

  if (position === 'right') {
    left = Math.min(rect.right + 20, vw - tw - 16);
    top = Math.max(rect.top, 16);
    if (top + th > vh) top = vh - th - 16;
  } else if (position === 'bottom') {
    left = Math.max(rect.left, 16);
    if (left + tw > vw) left = vw - tw - 16;
    top = rect.bottom + 16;
    if (top + th > vh) top = rect.top - th - 16;
  } else {
    centerTooltip(tooltip);
    return;
  }

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.style.transform = 'none';
}

function centerTooltip(tooltip) {
  tooltip.style.left = '50%';
  tooltip.style.top = '50%';
  tooltip.style.transform = 'translate(-50%, -50%)';
  const highlight = document.getElementById('demoHighlight');
  highlight.style.cssText = 'width:0;height:0;opacity:0';
  highlight.className = 'demo-highlight';
}

// Wire demo buttons
document.getElementById('demoNext').onclick = () => {
  if (demoStep < DEMO_STEPS.length - 1) {
    demoStep++;
    renderDemoStep();
  } else {
    endDemo();
  }
};
document.getElementById('demoPrev').onclick = () => {
  if (demoStep > 0) { demoStep--; renderDemoStep(); }
};
document.getElementById('demoSkip').onclick = () => endDemo();

// Expose globally
window.startDemo = startDemo;
