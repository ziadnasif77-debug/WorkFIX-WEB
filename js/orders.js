/* ============================================
   DATA FUNCTIONS — ORDERS, QUOTES, PAYMENTS
   ============================================ */
async function loadCategories() {
  const { data } = await db.from('categories').select('*').eq('is_active', true).order('sort_order');
  state.categories = data || [];
}

async function loadOrders(filter = 'all') {
  if (!state.user) return;
  setLoading('orders', true);
  render();
  let q = db.from('orders').select('*, categories(*)');
  const role = state.profile?.role;
  if (role === 'customer') q = q.eq('customer_id', state.user.id);
  else if (role === 'provider') q = q.eq('provider_id', state.user.id);
  if (filter === 'active') q = q.in('status', ['pending', 'quoted', 'confirmed', 'payment_pending', 'in_progress']);
  else if (filter === 'completed') q = q.in('status', ['completed', 'closed']);
  else if (filter === 'cancelled') q = q.eq('status', 'cancelled');
  q = q.order('created_at', { ascending: false }).limit(CONFIG.PAGE_SIZE);
  const { data } = await q;
  state.orders = data || [];
  setLoading('orders', false);
  render();
}

async function loadOrder(id) {
  const { data: order } = await db.from('orders').select('*, categories(*)').eq('id', id).single();
  state.currentOrder = order;
  const { data: quotes } = await db.from('quotes').select('*, profiles:provider_id(display_name, photo_url)').eq('order_id', id).order('created_at');
  state.currentQuotes = quotes || [];
}

async function createOrder(formData) {
  setLoading('createOrder', true);
  render();

  let photoUrls = [];
  if (pendingOrderPhotos.length > 0) {
    photoUrls = await uploadOrderPhotos(pendingOrderPhotos);
  }

  const { data, error } = await db.rpc('create_order', {
    p_category_id: formData.categoryId,
    p_title: formData.title,
    p_description: formData.description,
    p_lat: formData.lat,
    p_lng: formData.lng,
    p_address: formData.address,
    p_geohash: formData.geohash || 'u4pru',
    p_budget: formData.budget || null,
    p_currency: formData.currency || 'SAR'
  });
  setLoading('createOrder', false);
  if (error) { showToast(error.message, 'error'); render(); return; }

  if (data && photoUrls.length > 0) {
    await db.from('orders').update({ photo_urls: photoUrls }).eq('id', data);
  }

  pendingOrderPhotos = [];
  showToast(t('done'), 'success');
  navigate('orders');
}

async function submitQuote(orderId, price, estimatedHours, notes) {
  setLoading('submitQuote', true);
  render();
  const { error } = await db.rpc('submit_quote', {
    p_order_id: orderId, p_price: price,
    p_estimated_hours: estimatedHours || null, p_notes: notes || null
  });
  setLoading('submitQuote', false);
  if (error) { showToast(error.message, 'error'); } else { showToast(t('done'), 'success'); goBack(); }
  render();
}

async function acceptQuote(orderId, quoteId) {
  const { error } = await db.rpc('accept_quote', { p_order_id: orderId, p_quote_id: quoteId });
  if (error) { showToast(error.message, 'error'); return; }
  showToast(t('done'), 'success');
  await loadOrder(orderId);
  render();
}

async function cancelOrder(orderId) {
  const { error } = await db.rpc('cancel_order', { p_order_id: orderId });
  if (error) { showToast(error.message, 'error'); return; }
  showToast(t('done'), 'success');
  navigate('orders');
}

async function markComplete(orderId) {
  const { error } = await db.rpc('mark_order_complete', { p_order_id: orderId });
  if (error) { showToast(error.message, 'error'); return; }
  showToast(t('done'), 'success');
  await loadOrder(orderId);
  render();
}

async function confirmCompletion(orderId) {
  const { error } = await db.rpc('confirm_completion', { p_order_id: orderId });
  if (error) { showToast(error.message, 'error'); return; }
  showToast(t('done'), 'success');
  await loadOrder(orderId);
  render();
}

async function handleSubmitReview(orderId, rating, comment) {
  const { error } = await db.rpc('submit_review', {
    p_order_id: orderId, p_rating: rating, p_comment: comment || null
  });
  if (error) { showToast(error.message, 'error'); return; }
  showToast(t('done'), 'success');
  goBack();
}

async function handleOpenDispute(orderId, reason) {
  const { error } = await db.rpc('open_dispute', {
    p_order_id: orderId, p_reason: reason
  });
  if (error) { showToast(error.message, 'error'); return; }
  showToast(t('done'), 'success');
  await loadOrder(orderId);
  render();
}

/* ============================================
   PAYMENT PROCESSING
   ============================================ */
async function processPayment(orderId, method) {
  setLoading('payment', true);
  render();
  const o = state.currentOrder;
  if (!o) { setLoading('payment', false); return; }

  const country = state.profile?.country || 'SA';
  const countryConfig = CONFIG.SUPPORTED_COUNTRIES[country] || CONFIG.SUPPORTED_COUNTRIES.SA;
  const vatRate = countryConfig.vat;
  const subtotal = o.quoted_price || 0;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;
  const commissionAmount = subtotal * CONFIG.DEFAULT_COMMISSION_RATE;
  const netAmount = subtotal - commissionAmount;

  const { data: payment, error } = await db.from('payments').insert({
    order_id: orderId,
    customer_id: o.customer_id,
    provider_id: o.provider_id,
    amount: total,
    commission: commissionAmount,
    net_amount: netAmount,
    status: 'initiated',
    method: method,
    currency: o.currency
  }).select().single();

  if (error) {
    showToast(t('payment_failed'), 'error');
    setLoading('payment', false);
    render();
    return;
  }

  await db.from('orders').update({
    status: 'payment_pending',
    payment_status: 'initiated',
    payment_method: method,
    commission_amount: commissionAmount,
    net_amount: netAmount,
    final_price: total
  }).eq('id', orderId);

  // Simulate payment capture (in production: Tap redirect)
  setTimeout(async () => {
    await db.from('payments').update({ status: 'captured', captured_at: new Date().toISOString() }).eq('id', payment.id);
    await db.from('orders').update({ status: 'in_progress', payment_status: 'captured' }).eq('id', orderId);
    setLoading('payment', false);
    showToast(t('payment_success'), 'success');
    showLocalNotification('WorkFix', t('escrow_held'));
    await loadOrder(orderId);
    navigate('order-detail', { orderId });
  }, 2000);
}

/* ============================================
   DISPATCH SCORING ENGINE
   ============================================ */
function calculateDispatchScore(provider, orderLat, orderLng) {
  const ratingScore = provider.avg_rating || CONFIG.BAYESIAN_M;
  const responseScore = Math.max(0, 1 - (provider.avg_response_minutes || 30) / 120);
  const acceptanceScore = provider.acceptance_rate || 0.8;
  const completedScore = Math.min(1, (provider.completed_orders || 0) / 50);
  const distanceKm = haversine(orderLat, orderLng, provider.location_lat, provider.location_lng);
  const distanceScore = Math.max(0, 1 - distanceKm / 50);

  let boostMultiplier = 1.0;
  if (provider.has_active_boost) boostMultiplier = 1.20;
  if ((provider.completed_orders || 0) < 10) boostMultiplier *= 1.10;

  const score = (
    ratingScore * 0.30 +
    responseScore * 0.20 +
    acceptanceScore * 0.15 +
    completedScore * 0.10 +
    distanceScore * 0.25
  ) * boostMultiplier;

  return { score: Math.round(score * 1000) / 1000, distanceKm: Math.round(distanceKm * 10) / 10 };
}

function haversine(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 999;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function dispatchToProviders(orderId, orderLat, orderLng, categoryId) {
  const { data: providers } = await db.from('provider_profiles')
    .select('*, profiles!inner(display_name, kyc_status)')
    .eq('is_available', true).eq('is_verified', true);
  if (!providers || providers.length === 0) return [];

  const { data: boosts } = await db.from('boosts')
    .select('provider_id').eq('active', true);
  const boostedIds = new Set((boosts || []).map(b => b.provider_id));

  const scored = providers.map(p => ({
    ...p,
    has_active_boost: boostedIds.has(p.id),
    ...calculateDispatchScore({ ...p, has_active_boost: boostedIds.has(p.id) }, orderLat, orderLng)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, CONFIG.DISPATCH_CAP);
}

/* ============================================
   OSRM ROUTING
   ============================================ */
async function getRoute(fromLat, fromLng, toLat, toLng, mode = 'driving') {
  const profile = mode === 'walking' ? 'foot' : 'car';
  const url = `https://router.project-osrm.org/route/v1/${profile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distanceKm: Math.round(route.distance / 100) / 10,
        durationMin: Math.round(route.duration / 60),
        geometry: route.geometry
      };
    }
  } catch (e) { console.error('OSRM error:', e); }
  return null;
}

let routeLayer = null;
async function showRouteOnMap(map, fromLat, fromLng, toLat, toLng) {
  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
  const walkRoute = await getRoute(fromLat, fromLng, toLat, toLng, 'walking');
  const driveRoute = await getRoute(fromLat, fromLng, toLat, toLng, 'driving');
  if (driveRoute?.geometry) {
    const coords = driveRoute.geometry.coordinates.map(c => [c[1], c[0]]);
    routeLayer = L.polyline(coords, { color: '#2563eb', weight: 4, opacity: 0.8 }).addTo(map);
    map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
  }
  return { walking: walkRoute, driving: driveRoute };
}

/* ============================================
   IMAGE UPLOAD (Supabase Storage)
   ============================================ */
async function uploadImage(file, bucket = 'photos', folder = '') {
  if (!file) return null;
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  showToast(t('uploading'), 'info');
  const { data, error } = await db.storage.from(bucket).upload(path, file, {
    cacheControl: '3600', upsert: false
  });
  if (error) { showToast(t('upload_error'), 'error'); return null; }
  const { data: urlData } = db.storage.from(bucket).getPublicUrl(data.path);
  showToast(t('upload_success'), 'success');
  return urlData.publicUrl;
}

async function uploadOrderPhotos(files) {
  const urls = [];
  for (const file of files) {
    const url = await uploadImage(file, 'order-photos', state.user?.id);
    if (url) urls.push(url);
  }
  return urls;
}

async function uploadKycDocument(file, type) {
  return uploadImage(file, 'kyc-documents', `${state.user?.id}/${type}`);
}

async function uploadAvatar(file) {
  const url = await uploadImage(file, 'avatars', state.user?.id);
  if (url) {
    await db.from('profiles').update({ photo_url: url }).eq('id', state.user.id);
    state.profile.photo_url = url;
  }
  return url;
}

/* ============================================
   WEB PUSH NOTIFICATIONS
   ============================================ */
async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await registerPushToken();
    return true;
  }
  return false;
}

async function registerPushToken() {
  if (!('serviceWorker' in navigator) || !state.user) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
    });
    const token = JSON.stringify(sub);
    await db.from('push_tokens').upsert({
      user_id: state.user.id, token, platform: 'web'
    }, { onConflict: 'user_id,token' });
  } catch (e) { console.error('Push registration failed:', e); }
}

function showLocalNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'icon-192.png', badge: 'icon-192.png' });
  }
}

/* ============================================
   ORDER PHOTO HANDLING
   ============================================ */
let pendingOrderPhotos = [];

function handleOrderPhotoSelect(input) {
  const files = Array.from(input.files);
  files.forEach(file => {
    if (pendingOrderPhotos.length >= 5) return;
    pendingOrderPhotos.push(file);
  });
  renderOrderPhotoPreview();
}

function renderOrderPhotoPreview() {
  const el = $('#order-photo-preview');
  if (!el) return;
  el.innerHTML = pendingOrderPhotos.map((f, i) => `
    <div class="photo-thumb">
      <img src="${URL.createObjectURL(f)}" alt="">
      <div class="remove-photo" onclick="removeOrderPhoto(${i})">✕</div>
    </div>
  `).join('');
}

function removeOrderPhoto(idx) {
  pendingOrderPhotos.splice(idx, 1);
  renderOrderPhotoPreview();
}

/* ============================================
   KYC FILE HANDLING
   ============================================ */
let kycFiles = { front: null, back: null, license: null };

function handleKycFileSelect(type, input) {
  kycFiles[type] = input.files[0] || null;
  const label = input.closest('label');
  if (label && kycFiles[type]) {
    label.innerHTML = `<i data-lucide="check-circle" style="width:18px;height:18px;display:inline-block;vertical-align:middle;color:var(--c-success)"></i> ${kycFiles[type].name} <input type="file" accept="image/*" style="display:none" id="kyc-${type}" onchange="handleKycFileSelect('${type}',this)">`;
    refreshIcons();
  }
}
