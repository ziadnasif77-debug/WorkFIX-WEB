/* ============================================
   MAIN RENDER
   ============================================ */
function render() {
  const app = $('#app');
  let html = '';

  switch (state.route) {
    case 'login': html = renderLogin(); break;
    case 'register': html = renderRegister(); break;
    case 'forgot-password': html = renderForgotPassword(); break;
    case 'home': html = renderCustomerHome(); break;
    case 'orders': html = renderOrders(); break;
    case 'create-order': html = renderCreateOrder(); break;
    case 'order-detail': html = renderOrderDetail(); break;
    case 'chat': html = renderChat(); break;
    case 'explore': html = renderExplore(); break;
    case 'payment': html = renderPayment(); break;
    case 'review': html = renderReview(); break;
    case 'profile': html = renderProfile(); break;
    case 'edit-profile': html = renderEditProfile(); break;
    case 'settings': html = renderSettings(); break;
    case 'dispute': html = renderDispute(); break;
    case 'provider-dashboard': html = renderProviderDashboard(); break;
    case 'provider-orders': html = renderProviderOrders(); break;
    case 'provider-earnings': html = renderEarnings(); break;
    case 'provider-profile': html = renderProviderProfile(); break;
    case 'quote-submit': html = renderQuoteSubmit(); break;
    case 'kyc': html = renderKyc(); break;
    case 'admin-dashboard': html = renderAdminDashboard(); break;
    case 'admin-users': html = renderAdminUsers(); break;
    case 'admin-disputes': html = renderAdminDisputes(); break;
    case 'admin-reports': html = renderAdminReports(); break;
    case 'phone-verify': html = renderPhoneVerify(); break;
    case 'subscription': html = renderSubscription(); break;
    case 'boost': html = renderBoost(); break;
    case 'provider-detail': html = renderProviderDetail(); break;
    case 'audit-logs': html = renderAuditLogs(); break;
    case 'account-deletion': html = renderAccountDeletion(); break;
    default: html = renderLogin();
  }

  app.innerHTML = html;
  refreshIcons();

  // Cleanup maps when leaving their pages
  if (state.route !== 'create-order' && orderMap) {
    try { orderMap.remove(); } catch(e) {}
    orderMap = null;
    orderMarker = null;
  }
  if (state.route !== 'explore' && exploreMap) {
    try { exploreMap.remove(); } catch(e) {}
    exploreMap = null;
  }

  // Post-render hooks
  if (state.route === 'create-order') initOrderMap();
  if (state.route === 'explore') {
    initExploreMap();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        state.routeParams.userLat = pos.coords.latitude;
        state.routeParams.userLng = pos.coords.longitude;
        if (exploreMap) exploreMap.setView([pos.coords.latitude, pos.coords.longitude], 13);
        loadExploreProviders();
      }, () => loadExploreProviders());
    } else {
      loadExploreProviders();
    }
  }
  if (state.route === 'chat') {
    const msgList = $('#chat-messages');
    if (msgList) msgList.scrollTop = msgList.scrollHeight;
  }
  if (state.route === 'admin-users') debouncedSearchUsers('');
  if (state.route === 'admin-disputes') loadAndRenderDisputes(state.routeParams.disputeFilter || 'all');
  if (state.route === 'audit-logs') loadAndRenderAuditLogs();
  if (state.route === 'phone-verify') { setTimeout(() => { startOtpTimer(); $('#otp-0')?.focus(); }, 100); }
  if (state.route === 'admin-dashboard') {
    loadAdminStats().then(stats => {
      const grid = $('#admin-stats-grid');
      if (!grid) return;
      const labels = [t('total_users'), t('active_orders'), t('pending_kyc'), t('open_disputes')];
      const vals = [stats.totalUsers, stats.activeOrders, stats.pendingKyc, stats.openDisputes];
      grid.innerHTML = vals.map((v, i) => `
        <div class="stat-card"><div class="stat-value">${v}</div><div class="stat-label">${labels[i]}</div></div>
      `).join('');
    });
  }
  if (state.route === 'provider-dashboard') {
    loadProviderDashboardData().then(data => {
      const cards = $$('.stat-card .stat-value');
      if (cards.length >= 3) {
        cards[0].textContent = data.pendingQuotes;
        cards[1].textContent = data.activeJobs;
        cards[2].textContent = formatCurrency(data.earnedToday, CONFIG.SUPPORTED_COUNTRIES[state.profile?.country || 'SA']?.currency || 'SAR');
      }
    });
    loadIncomingRequests().then(orders => {
      const el = $('#incoming-requests');
      if (!el || !orders.length) return;
      el.innerHTML = orders.map(o => `
        <div class="order-card" onclick="navigate('quote-submit',{orderId:'${o.id}'})">
          <div class="order-card-top">
            <div class="order-card-title">${o.title}</div>
            ${statusBadge(o.status)}
          </div>
          <div class="order-card-meta">
            <span>${icon('map-pin', 14)} ${o.address || ''}</span>
            <span>${icon('clock', 14)} ${timeAgo(o.created_at)}</span>
          </div>
          ${o.budget ? `<div class="order-card-price">${formatCurrency(o.budget, o.currency)}</div>` : ''}
        </div>
      `).join('');
    });
  }
  if (state.route === 'admin-reports' && !state.routeParams.reportData) {
    loadReportPeriod('this_month');
  }

  // Bind events
  bindEvents();
}

function bindEvents() {
  const loginBtn = $('#login-btn');
  if (loginBtn) {
    loginBtn.onclick = () => {
      const email = $('#login-email')?.value;
      const password = $('#login-password')?.value;
      if (email && password) handleLogin(email, password);
    };
  }

  const registerBtn = $('#register-btn');
  if (registerBtn) {
    registerBtn.onclick = () => {
      const name = $('#reg-name')?.value;
      const email = $('#reg-email')?.value;
      const password = $('#reg-password')?.value;
      const confirm = $('#reg-confirm')?.value;
      const terms = $('#reg-terms')?.checked;
      const role = state.routeParams.selectedRole || 'customer';
      if (!name || name.length < 2) { showToast('Name must be at least 2 characters', 'error'); return; }
      if (!email) { showToast('Email is required', 'error'); return; }
      if (!password || password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
      if (password !== confirm) { showToast('Passwords do not match', 'error'); return; }
      if (!terms) { showToast('Please agree to the terms', 'error'); return; }
      handleRegister(name, email, password, role);
    };
  }

  const registerLink = $('#register-link');
  if (registerLink) registerLink.onclick = () => navigate('register');

  const forgotLink = $('#forgot-link');
  if (forgotLink) forgotLink.onclick = () => navigate('forgot-password');

  const toggleLoginMethod = $('#toggle-login-method');
  if (toggleLoginMethod) toggleLoginMethod.onclick = () => navigate('login', { phoneLogin: !state.routeParams.phoneLogin });

  const resetBtn = $('#reset-btn');
  if (resetBtn) resetBtn.onclick = () => {
    const email = $('#reset-email')?.value;
    if (email) handleResetPassword(email);
  };

  const submitOrderBtn = $('#submit-order-btn');
  if (submitOrderBtn) {
    submitOrderBtn.onclick = () => {
      const title = $('#order-title')?.value;
      const desc = $('#order-desc')?.value;
      const budget = parseFloat($('#order-budget')?.value) || null;
      const catId = state.routeParams.categoryId || $('#order-category')?.value;
      if (!catId) { showToast('Select a category', 'error'); return; }
      if (!title || title.length < 3) { showToast('Title must be at least 3 characters', 'error'); return; }
      if (!desc || desc.length < 10) { showToast('Description must be at least 10 characters', 'error'); return; }
      createOrder({
        categoryId: catId, title, description: desc,
        lat: state.routeParams.lat || 24.7136,
        lng: state.routeParams.lng || 46.6753,
        address: $('#order-address')?.value || 'Location',
        geohash: 'u4pru', budget,
        currency: CONFIG.SUPPORTED_COUNTRIES[state.profile?.country || 'SA']?.currency || 'SAR'
      });
    };
  }

  // Enter key on login
  const loginPassword = $('#login-password');
  if (loginPassword) loginPassword.onkeydown = e => { if (e.key === 'Enter') loginBtn?.click(); };
  const loginEmail = $('#login-email');
  if (loginEmail) loginEmail.onkeydown = e => { if (e.key === 'Enter') $('#login-password')?.focus(); };
}

/* ============================================
   PWA INSTALL
   ============================================ */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(r => { deferredPrompt = null; });
  }
}

/* ============================================
   INITIALIZATION
   ============================================ */
async function init() {
  try {
    // Language detection
    state.lang = detectLanguage();
    const dir = I18N[state.lang]?.dir || 'ltr';
    document.documentElement.lang = state.lang;
    document.documentElement.dir = dir;

    // Render login first
    render();

    if (!db) return;

    // Check existing session
    const { data: { session } } = await db.auth.getSession();
    if (session) {
      await loadUserProfile();
      await Promise.all([loadCategories(), loadFlags(), loadOrders()]);
      navigate(getDefaultRoute());
      setupRealtime();
    }

    // Listen for auth changes
    db.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile();
        await Promise.all([loadCategories(), loadFlags(), loadOrders()]);
        navigate(getDefaultRoute());
        setupRealtime();
      } else if (event === 'SIGNED_OUT') {
        state.user = null;
        state.profile = null;
        cleanupRealtime();
        navigate('login');
      }
    });

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'login';
      if (hash !== state.route) {
        state.route = hash;
        render();
      }
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  } catch (e) {
    console.error('Init error:', e);
  }
}

// Route-based data loading
const originalNavigate = navigate;
navigate = async function(route, params = {}) {
  originalNavigate(route, params);

  // Pre-fetch data for routes that need it
  if (route === 'home' && state.categories.length === 0) {
    await loadCategories();
    await loadOrders();
    render();
  }
  if (route === 'orders' || route === 'provider-orders') {
    await loadOrders(params.filter || 'all');
  }
  if (route === 'order-detail' && params.orderId) {
    await loadOrder(params.orderId);
    render();
  }
  if (route === 'payment' && params.orderId && !state.currentOrder) {
    await loadOrder(params.orderId);
    render();
  }
  if (route === 'quote-submit' && params.orderId) {
    await loadOrder(params.orderId);
    render();
  }
  if (route === 'provider-earnings') {
    await loadEarnings();
    render();
  }
  if (route === 'chat' && params.conversationId) {
    await loadMessages(params.conversationId);
    render();
  }
  if (route === 'explore' && state.categories.length === 0) {
    await loadCategories();
    render();
  }
};

// Start the app
init();
