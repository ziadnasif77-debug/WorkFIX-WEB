/* ============================================
   ADMIN FUNCTIONS
   ============================================ */
// Admin
async function loadAdminUsers(search = '') {
  if (!db) return [];
  let q = db.from('profiles').select('*').order('created_at', { ascending: false }).limit(CONFIG.PAGE_SIZE);
  if (search) q = q.ilike('display_name', `%${search}%`);
  const { data } = await q;
  return data || [];
}

async function loadAdminDisputes(filter = 'all') {
  if (!db) return [];
  let q = db.from('disputes').select('*, orders(title)').order('created_at', { ascending: false });
  if (filter !== 'all') q = q.eq('status', filter);
  const { data } = await q;
  return data || [];
}

async function adminBanUser(userId, ban, reason) {
  if (!db) return;
  const { error } = await db.rpc('admin_ban_user', {
    p_user_id: userId, p_ban: ban, p_reason: reason || null
  });
  if (error) showToast(error.message, 'error');
  else showToast(t('done'), 'success');
}

async function adminKycDecision(uid, approved, reason) {
  if (!db) return;
  const { error } = await db.rpc('admin_kyc_decision', {
    p_uid: uid, p_approved: approved, p_reason: reason || null
  });
  if (error) showToast(error.message, 'error');
  else showToast(t('done'), 'success');
}

async function adminResolveDispute(disputeId, resolution, note) {
  if (!db) return;
  const { error } = await db.rpc('resolve_dispute', {
    p_dispute_id: disputeId, p_resolution: resolution, p_admin_note: note || null
  });
  if (error) showToast(error.message, 'error');
  else showToast(t('done'), 'success');
}

/* ============================================
   ADMIN DATA - REPORTS & AUDIT
   ============================================ */
async function loadReportData(fromDate, toDate) {
  if (!db) return { totalRevenue:0, totalCommission:0, totalOrders:0, avgOrderValue:0, cancelledOrders:0, disputeRate:0, newUsers:0, activeProviders:0, weeklyData:[0,0,0,0,0,0,0] };
  let q = db.from('payments').select('amount, commission, net_amount, currency, created_at, status')
    .eq('status', 'captured');
  if (fromDate) q = q.gte('created_at', fromDate);
  if (toDate) q = q.lte('created_at', toDate + 'T23:59:59');
  const { data: payments } = await q;

  const { count: totalOrders } = await db.from('orders').select('*', { count: 'exact', head: true });
  const { count: cancelledOrders } = await db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled');
  const { count: newUsers } = await db.from('profiles').select('*', { count: 'exact', head: true });
  const { count: activeProviders } = await db.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('is_available', true);
  const { count: disputeCount } = await db.from('disputes').select('*', { count: 'exact', head: true });

  const totalRevenue = (payments || []).reduce((s, p) => s + (p.amount || 0), 0);
  const totalCommission = (payments || []).reduce((s, p) => s + (p.commission || 0), 0);
  const avgOrderValue = payments?.length ? totalRevenue / payments.length : 0;
  const disputeRate = totalOrders ? ((disputeCount || 0) / totalOrders * 100).toFixed(1) : 0;

  // Weekly data for chart
  const weeklyData = [0,0,0,0,0,0,0];
  (payments || []).forEach(p => {
    const day = new Date(p.created_at).getDay();
    weeklyData[day] += p.amount || 0;
  });

  return {
    totalRevenue, totalCommission, totalOrders: totalOrders || 0,
    avgOrderValue, cancelledOrders: cancelledOrders || 0,
    disputeRate, newUsers: newUsers || 0,
    activeProviders: activeProviders || 0, weeklyData
  };
}

async function loadAuditLogs(limit = 50) {
  if (!db) return [];
  const { data } = await db.from('audit_logs').select('*')
    .order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

/* ============================================
   ADMIN DASHBOARD STATS
   ============================================ */
async function loadAdminStats() {
  if (!db) return { totalUsers:0, activeOrders:0, pendingKyc:0, openDisputes:0 };
  const [users, orders, kyc, disputes] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending','quoted','confirmed','payment_pending','in_progress']),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
    db.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open')
  ]);
  return {
    totalUsers: users.count || 0,
    activeOrders: orders.count || 0,
    pendingKyc: kyc.count || 0,
    openDisputes: disputes.count || 0
  };
}

/* ============================================
   DATA EXPORT & ACCOUNT DELETION
   ============================================ */
async function requestDataExport() {
  if (!db) return;
  await db.from('audit_logs').insert({
    action: 'data_export_requested', actor_id: state.user.id,
    payload: { user_id: state.user.id }
  });
  showToast(t('export_requested'), 'info');
}

async function requestAccountDeletion() {
  if (!db) return;
  const { error } = await db.from('profiles').update({
    is_active: false
  }).eq('id', state.user.id);
  if (!error) {
    await db.from('audit_logs').insert({
      action: 'account_deletion_requested', actor_id: state.user.id,
      payload: { user_id: state.user.id, grace_period_days: 30 }
    });
    showToast(t('done'), 'info');
    handleLogout();
  }
}
