/* ============================================
   AUTH FUNCTIONS
   ============================================ */
async function handleLogin(email, password) {
  if (!db) { showToast('Service unavailable. Please refresh.', 'error'); return; }
  const btn = $('#login-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>'; }
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (btn) { btn.disabled = false; btn.textContent = t('login'); }
  if (error) { showToast(error.message, 'error'); return; }
  await loadUserProfile();
  navigate(getDefaultRoute());
}

async function handleRegister(name, email, password, role) {
  if (!db) { showToast('Service unavailable. Please refresh.', 'error'); return; }
  const btn = $('#register-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>'; }
  const { data, error } = await db.auth.signUp({
    email, password,
    options: { data: { display_name: name, role } }
  });
  if (btn) { btn.disabled = false; btn.textContent = t('create_account'); }
  if (error) { showToast(error.message, 'error'); return; }
  if (data.user && !data.user.identities?.length) {
    showToast(t('email') + ' already registered', 'error');
    return;
  }
  if (data.session) {
    await loadUserProfile();
    navigate(getDefaultRoute());
  } else {
    showToast('Check your email to confirm your account', 'info');
  }
}

async function handleLogout() {
  if (db) await db.auth.signOut();
  state.user = null;
  state.profile = null;
  state.providerProfile = null;
  state.orders = [];
  state.routeHistory = [];
  navigate('login');
}

async function handleResetPassword(email) {
  if (!db) { showToast('Service unavailable. Please refresh.', 'error'); return; }
  setLoading('auth', true);
  render();
  const { error } = await db.auth.resetPasswordForEmail(email);
  setLoading('auth', false);
  if (error) { showToast(error.message, 'error'); } else { showToast(t('reset_sent'), 'info'); }
  render();
}

async function loadUserProfile() {
  if (!db) return;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return;
  state.user = user;
  const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single();
  state.profile = profile;
  if (profile?.role === 'provider') {
    const { data: pp } = await db.from('provider_profiles').select('*').eq('id', user.id).single();
    state.providerProfile = pp;
  }
}

