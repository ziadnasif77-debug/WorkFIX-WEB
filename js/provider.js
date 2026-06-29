/* ============================================
   PROVIDER FUNCTIONS
   ============================================ */
// Feature flags
async function loadFlags() {
  if (!db) return;
  const { data } = await db.from('feature_flags').select('*');
  if (data) data.forEach(f => state.flags[f.key] = f.enabled);
}

// Provider orders (incoming, not yet quoted)
async function loadIncomingRequests() {
  if (!db) return [];
  const { data } = await db.from('orders').select('*, categories(*)')
    .in('status', ['pending', 'quoted']).order('created_at', { ascending: false }).limit(20);
  return data || [];
}

// Provider earnings
async function loadEarnings() {
  if (!db || !state.user) return { available: 0, pending: 0, history: [] };
  const { data } = await db.from('payments').select('*')
    .eq('provider_id', state.user.id).eq('status', 'captured').order('created_at', { ascending: false });
  const history = data || [];
  const available = history.reduce((s, p) => s + (p.net_amount || 0), 0);
  return { available, pending: 0, history };
}

/* ============================================
   PROVIDER DASHBOARD DATA
   ============================================ */
async function loadProviderDashboardData() {
  if (!db || !state.user) return { pendingQuotes: 0, activeJobs: 0, earnedToday: 0 };
  const today = new Date().toISOString().split('T')[0];

  const [quotes, jobs, earnings] = await Promise.all([
    db.from('quotes').select('*', { count: 'exact', head: true })
      .eq('provider_id', state.user.id).eq('status', 'pending'),
    db.from('orders').select('*', { count: 'exact', head: true })
      .eq('provider_id', state.user.id).eq('status', 'in_progress'),
    db.from('payments').select('net_amount')
      .eq('provider_id', state.user.id).eq('status', 'captured')
      .gte('created_at', today + 'T00:00:00')
  ]);

  return {
    pendingQuotes: quotes.count || 0,
    activeJobs: jobs.count || 0,
    earnedToday: (earnings.data || []).reduce((s, p) => s + (p.net_amount || 0), 0)
  };
}
