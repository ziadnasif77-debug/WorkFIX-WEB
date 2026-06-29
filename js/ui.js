/* ============================================
   SCREEN RENDERERS
   ============================================ */

function renderLogin() {
  const isPhone = state.routeParams.phoneLogin;
  return `
    <div class="screen active" style="justify-content:center">
      <div class="content-padded" style="max-width:400px;margin:0 auto;width:100%">
        <div style="text-align:center;margin-bottom:var(--space-xl)">
          <div style="margin-bottom:var(--space-md)">${icon('wrench', 48)}</div>
          <h1 style="font-size:var(--font-xxl);font-weight:800;margin-bottom:var(--space-xs)">WorkFix</h1>
          <p style="color:var(--c-text-secondary)">${t('welcome_back')}</p>
        </div>
        <div id="login-form">
          ${isPhone ? `
            <div class="input-group">
              <label class="input-label">${t('phone')}</label>
              <input class="input" type="tel" id="login-phone" placeholder="+966..." dir="ltr">
            </div>
          ` : `
            <div class="input-group">
              <label class="input-label">${t('email')}</label>
              <input class="input" type="email" id="login-email" placeholder="name@example.com" dir="ltr" autocomplete="email">
            </div>
            <div class="input-group">
              <label class="input-label">${t('password')}</label>
              <input class="input" type="password" id="login-password" placeholder="••••••••" autocomplete="current-password">
            </div>
          `}
          <button class="btn btn-primary btn-full btn-lg" id="login-btn" ${state.loading.auth ? 'disabled' : ''}>
            ${state.loading.auth ? '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>' : t('login')}
          </button>
          <div style="text-align:center;margin-top:var(--space-md)">
            <a href="javascript:void(0)" id="forgot-link" style="font-size:var(--font-sm)">${t('forgot_password')}</a>
          </div>
          <div style="text-align:center;margin-top:var(--space-sm)">
            <a href="javascript:void(0)" id="toggle-login-method" style="font-size:var(--font-sm)">
              ${isPhone ? t('email_login') : t('phone_login')}
            </a>
          </div>
          <div style="text-align:center;margin-top:var(--space-lg)">
            <span style="color:var(--c-text-secondary);font-size:var(--font-sm)">${t('no_account')} </span>
            <a href="javascript:void(0)" id="register-link" style="font-weight:600;font-size:var(--font-sm)">${t('sign_up')}</a>
          </div>
        </div>
      </div>
    </div>`;
}

function renderRegister() {
  const selectedRole = state.routeParams.selectedRole || '';
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="navigate('login')">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('create_account')}</div>
      </div>
      <div class="content content-padded" style="max-width:400px;margin:0 auto;width:100%">
        <div class="input-group">
          <label class="input-label">${t('full_name')}</label>
          <input class="input" type="text" id="reg-name" placeholder="${t('full_name')}" autocomplete="name">
        </div>
        <div class="input-group">
          <label class="input-label">${t('email')}</label>
          <input class="input" type="email" id="reg-email" placeholder="name@example.com" dir="ltr" autocomplete="email">
        </div>
        <div class="input-group">
          <label class="input-label">${t('password')}</label>
          <input class="input" type="password" id="reg-password" placeholder="••••••••" autocomplete="new-password">
        </div>
        <div class="input-group">
          <label class="input-label">${t('confirm_password')}</label>
          <input class="input" type="password" id="reg-confirm" placeholder="••••••••" autocomplete="new-password">
        </div>
        <div class="input-group">
          <label class="input-label" style="margin-bottom:var(--space-sm)">${t('looking_for_service')} ${t('or')} ${t('offering_service')}?</label>
          <div style="display:flex;gap:var(--space-sm)">
            <div id="role-customer" class="card card-padded card-hover" style="flex:1;text-align:center;${selectedRole === 'customer' ? 'border-color:var(--c-primary);background:var(--c-primary-light)' : ''}"
                 onclick="selectRole('customer')">
              <div style="margin-bottom:var(--space-xs)">${icon('home', 28)}</div>
              <div style="font-weight:600;font-size:var(--font-sm)">${t('looking_for_service')}</div>
            </div>
            <div id="role-provider" class="card card-padded card-hover" style="flex:1;text-align:center;${selectedRole === 'provider' ? 'border-color:var(--c-primary);background:var(--c-primary-light)' : ''}"
                 onclick="selectRole('provider')">
              <div style="margin-bottom:var(--space-xs)">${icon('wrench', 28)}</div>
              <div style="font-weight:600;font-size:var(--font-sm)">${t('offering_service')}</div>
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-lg)">
          <input type="checkbox" id="reg-terms" style="width:18px;height:18px;accent-color:var(--c-primary)">
          <label for="reg-terms" style="font-size:var(--font-sm);color:var(--c-text-secondary)">${t('agree_terms')}</label>
        </div>
        <button class="btn btn-primary btn-full btn-lg" id="register-btn" ${state.loading.auth ? 'disabled' : ''}>
          ${state.loading.auth ? '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>' : t('create_account')}
        </button>
      </div>
    </div>`;
}

function selectRole(role) {
  state.routeParams.selectedRole = role;
  const cust = $('#role-customer');
  const prov = $('#role-provider');
  if (cust && prov) {
    cust.style.borderColor = role === 'customer' ? 'var(--c-primary)' : '';
    cust.style.background = role === 'customer' ? 'var(--c-primary-light)' : '';
    prov.style.borderColor = role === 'provider' ? 'var(--c-primary)' : '';
    prov.style.background = role === 'provider' ? 'var(--c-primary-light)' : '';
  }
}

function renderForgotPassword() {
  return `
    <div class="screen active" style="justify-content:center">
      <div class="content-padded" style="max-width:400px;margin:0 auto;width:100%">
        <div class="header-back" onclick="navigate('login')" style="margin-bottom:var(--space-lg)">${icon('arrow-left', 20)}</div>
        <h2 style="margin-bottom:var(--space-md)">${t('reset_password')}</h2>
        <div class="input-group">
          <label class="input-label">${t('email')}</label>
          <input class="input" type="email" id="reset-email" dir="ltr" autocomplete="email">
        </div>
        <button class="btn btn-primary btn-full" id="reset-btn" ${state.loading.auth ? 'disabled' : ''}>
          ${state.loading.auth ? '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>' : t('send_reset_link')}
        </button>
      </div>
    </div>`;
}

function renderCustomerHome() {
  const name = state.profile?.display_name?.split(' ')[0] || '';
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-title">${t('hello')}, ${name} 👋</div>
        <div class="header-action" onclick="navigate('profile')">
          <div class="avatar avatar-sm">${getInitials(state.profile?.display_name)}</div>
        </div>
      </div>
      <div class="content">
        <div class="search-bar" onclick="navigate('explore')">
          <span class="search-icon">${icon('search', 18)}</span>
          <input placeholder="${t('search_services')}" readonly style="cursor:pointer">
        </div>
        <div class="category-grid">
          ${state.categories.map(cat => `
            <div class="category-card" onclick="navigate('create-order',{categoryId:'${cat.id}',categoryName:'${getCategoryName(cat)}',categoryIcon:'${cat.icon}'})">
              <div class="cat-icon">${icon(catIconMap(cat.icon), 28)}</div>
              <div class="cat-name">${getCategoryName(cat)}</div>
            </div>
          `).join('')}
        </div>
        <div class="section-header">
          <div class="section-title">${t('recent_orders')}</div>
          <div class="section-link" onclick="state.activeTab='orders';navigate('orders')">${t('view_all')}</div>
        </div>
        ${state.orders.length === 0 ? `
          <div class="empty-state" style="padding:var(--space-lg)">
            <div class="empty-icon">${icon('clipboard-list', 48)}</div>
            <div class="empty-text">${t('no_orders_desc')}</div>
          </div>
        ` : `
          <div class="h-scroll">
            ${state.orders.slice(0, 5).map(o => `
              <div class="card card-padded card-hover h-scroll-card" onclick="navigate('order-detail',{orderId:'${o.id}'})">
                <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-sm)">
                  <span style="font-weight:600">${o.title}</span>
                  ${statusBadge(o.status)}
                </div>
                <div style="font-size:var(--font-sm);color:var(--c-text-secondary)">${timeAgo(o.created_at)}</div>
                ${o.quoted_price ? `<div class="order-card-price" style="margin-top:var(--space-xs)">${formatCurrency(o.quoted_price, o.currency)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>
      ${renderCustomerTabs()}
    </div>`;
}

function renderCustomerTabs() {
  const tabs = [
    { id: 'home', icon: 'home', label: t('home') },
    { id: 'orders', icon: 'clipboard-list', label: t('my_orders') },
    { id: 'explore', icon: 'compass', label: t('explore') },
    { id: 'profile', icon: 'user', label: t('profile') }
  ];
  return `<div class="tab-bar">${tabs.map(tab => `
    <div class="tab-item ${state.activeTab === tab.id ? 'active' : ''}" onclick="state.activeTab='${tab.id}';navigate('${tab.id === 'home' ? 'home' : tab.id}')">
      <span class="tab-icon">${icon(tab.icon, 22)}</span>
      <span class="tab-label">${tab.label}</span>
    </div>`).join('')}</div>`;
}

function renderProviderTabs() {
  const tabs = [
    { id: 'provider-dashboard', icon: 'layout-dashboard', label: t('dashboard') },
    { id: 'provider-orders', icon: 'clipboard-list', label: t('my_orders') },
    { id: 'provider-earnings', icon: 'wallet', label: t('earnings') },
    { id: 'provider-profile', icon: 'user', label: t('profile') }
  ];
  return `<div class="tab-bar">${tabs.map(tab => `
    <div class="tab-item ${state.route === tab.id ? 'active' : ''}" onclick="navigate('${tab.id}')">
      <span class="tab-icon">${icon(tab.icon, 22)}</span>
      <span class="tab-label">${tab.label}</span>
    </div>`).join('')}</div>`;
}

function renderOrders() {
  const filter = state.routeParams.filter || 'all';
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-title">${t('my_orders')}</div>
        ${state.profile?.role === 'customer' ? `<div class="header-action" onclick="navigate('create-order')">➕</div>` : ''}
      </div>
      <div class="chip-row">
        ${['all','active','completed','cancelled'].map(f => `
          <div class="chip ${filter === f ? 'active' : ''}" onclick="state.routeParams.filter='${f}';loadOrders('${f}')">${t(f)}</div>
        `).join('')}
      </div>
      <div class="content">
        ${state.loading.orders ? `<div class="spinner-center"><div class="spinner"></div></div>` :
          state.orders.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">📭</div>
              <div class="empty-title">${t('no_orders')}</div>
              <div class="empty-text">${t('no_orders_desc')}</div>
            </div>` :
          state.orders.map(o => `
            <div class="order-card" onclick="navigate('order-detail',{orderId:'${o.id}'})">
              <div class="order-card-top">
                <div class="order-card-title">${o.title}</div>
                ${statusBadge(o.status)}
              </div>
              <div class="order-card-meta">
                <span>${icon(catIconMap(o.categories?.icon), 16)} ${getCategoryName(o.categories)}</span>
                <span>${timeAgo(o.created_at)}</span>
                ${o.quoted_price ? `<span class="order-card-price">${formatCurrency(o.quoted_price, o.currency)}</span>` : ''}
              </div>
            </div>
          `).join('')
        }
      </div>
      ${state.profile?.role === 'customer' ? renderCustomerTabs() : renderProviderTabs()}
    </div>`;
}

function renderCreateOrder() {
  const catId = state.routeParams.categoryId || '';
  const catName = state.routeParams.categoryName || '';
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('new_order')}</div>
      </div>
      <div class="content content-padded">
        ${catId ? `<div class="badge badge-primary" style="margin-bottom:var(--space-md)">${icon(catIconMap(state.routeParams.categoryIcon), 16)} ${catName}</div>` : `
          <div class="input-group">
            <label class="input-label">${t('service_categories')}</label>
            <select class="input" id="order-category">
              <option value="">${t('select_method')}</option>
              ${state.categories.map(c => `<option value="${c.id}">${getCategoryName(c)}</option>`).join('')}
            </select>
          </div>
        `}
        <div class="input-group">
          <label class="input-label">${t('order_title')}</label>
          <input class="input" id="order-title" placeholder="${t('order_title_ph')}" maxlength="200">
        </div>
        <div class="input-group">
          <label class="input-label">${t('description')}</label>
          <textarea class="input" id="order-desc" placeholder="${t('description_ph')}" maxlength="2000"></textarea>
        </div>
        <div class="input-group">
          <label class="input-label">${t('location')}</label>
          <div id="order-map" style="height:200px;border-radius:var(--radius-md);overflow:hidden;margin-bottom:var(--space-sm);background:var(--c-bg)"></div>
          <input class="input" id="order-address" placeholder="${t('location')}" readonly>
          <button class="btn btn-secondary btn-sm" style="margin-top:var(--space-sm)" onclick="useMyLocation()">${icon('map-pin', 16)} ${t('use_my_location')}</button>
        </div>
        <div class="input-group">
          <label class="input-label">${t('photos')}</label>
          <label class="btn btn-secondary btn-sm" style="cursor:pointer">
            ${icon('camera', 16)} ${t('add_photo')}
            <input type="file" accept="image/*" multiple style="display:none" id="order-photos" onchange="handleOrderPhotoSelect(this)">
          </label>
          <div class="photo-grid" id="order-photo-preview"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${t('budget')}</label>
          <input class="input" id="order-budget" type="number" min="0" placeholder="0.00" dir="ltr">
        </div>
        <button class="btn btn-primary btn-full btn-lg" id="submit-order-btn" ${state.loading.createOrder ? 'disabled' : ''}>
          ${state.loading.createOrder ? '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>' : t('submit_order')}
        </button>
      </div>
    </div>`;
}

function renderOrderDetail() {
  const o = state.currentOrder;
  if (!o) return `<div class="screen active"><div class="spinner-center"><div class="spinner"></div></div></div>`;
  const isCustomer = o.customer_id === state.user?.id;
  const isProvider = o.provider_id === state.user?.id;
  const isAdmin = state.profile?.role === 'admin' || state.profile?.role === 'superadmin';

  const steps = ['pending','quoted','confirmed','payment_pending','in_progress','completed','closed'];
  const currentStep = steps.indexOf(o.status);

  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('order_details')}</div>
        ${statusBadge(o.status)}
      </div>
      <div class="content content-padded">
        <div class="card card-padded" style="margin-bottom:var(--space-md)">
          <h3 style="margin-bottom:var(--space-sm)">${o.title}</h3>
          <p style="color:var(--c-text-secondary);margin-bottom:var(--space-md)">${o.description}</p>
          <div style="display:flex;gap:var(--space-md);flex-wrap:wrap;font-size:var(--font-sm);color:var(--c-text-secondary)">
            <span>${icon('map-pin', 14)} ${o.location_address || t('location')}</span>
            <span>${icon('calendar', 14)} ${formatDate(o.created_at)}</span>
            ${o.budget ? `<span>${icon('dollar-sign', 14)} ${formatCurrency(o.budget, o.currency)}</span>` : ''}
          </div>
        </div>

        <!-- Timeline -->
        <div class="card" style="margin-bottom:var(--space-md)">
          <div class="timeline">
            ${steps.map((s, i) => `
              <div class="timeline-step">
                <div class="timeline-dot ${i < currentStep ? 'done' : i === currentStep ? 'current' : 'pending'}">
                  ${i < currentStep ? '✔' : i + 1}
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">${t('status_' + s)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Quotes -->
        ${(o.status === 'quoted' || o.status === 'pending') && isCustomer ? `
          <h3 style="margin-bottom:var(--space-sm)">${t('quotes')} (${state.currentQuotes.length})</h3>
          ${state.currentQuotes.length === 0 ? `
            <div class="card card-padded" style="text-align:center;color:var(--c-text-secondary);margin-bottom:var(--space-md)">
              ${t('waiting_quotes')}
            </div>
          ` : state.currentQuotes.filter(q => q.status === 'pending').map(q => `
            <div class="quote-card">
              <div class="quote-card-header">
                <div class="avatar avatar-sm">${getInitials(q.profiles?.display_name)}</div>
                <div>
                  <div style="font-weight:600">${q.profiles?.display_name || t('provider')}</div>
                  ${q.estimated_hours ? `<div style="font-size:var(--font-xs);color:var(--c-text-secondary)">~${q.estimated_hours}h</div>` : ''}
                </div>
              </div>
              <div class="quote-card-price">${formatCurrency(q.price, q.currency)}</div>
              ${q.notes ? `<p style="font-size:var(--font-sm);color:var(--c-text-secondary);margin-top:var(--space-sm)">${q.notes}</p>` : ''}
              <div class="quote-card-actions">
                <button class="btn btn-primary btn-sm" onclick="acceptQuote('${o.id}','${q.id}')">${t('accept')}</button>
                <button class="btn btn-secondary btn-sm">${t('reject')}</button>
              </div>
            </div>
          `).join('')}
        ` : ''}

        <!-- Actions -->
        <div style="display:flex;flex-direction:column;gap:var(--space-sm);margin-top:var(--space-md)">
          ${o.status === 'confirmed' && isCustomer ? `
            <button class="btn btn-primary btn-full" onclick="navigate('payment',{orderId:'${o.id}'})">${t('pay_now')}</button>
          ` : ''}
          ${o.status === 'in_progress' && isProvider ? `
            <button class="btn btn-success btn-full" onclick="markComplete('${o.id}')">${t('mark_complete')}</button>
          ` : ''}
          ${o.status === 'completed' && isCustomer ? `
            <button class="btn btn-primary btn-full" onclick="confirmCompletion('${o.id}')">${t('confirm_completion')}</button>
          ` : ''}
          ${o.status === 'closed' && isCustomer ? `
            <button class="btn btn-secondary btn-full" onclick="navigate('review',{orderId:'${o.id}'})">${t('rate_service')}</button>
          ` : ''}
          ${['completed','closed'].includes(o.status) && isCustomer && state.flags.disputes_enabled ? `
            <button class="btn btn-danger btn-full btn-sm" onclick="navigate('dispute',{orderId:'${o.id}'})">${t('open_dispute')}</button>
          ` : ''}
          ${['pending','quoted','confirmed'].includes(o.status) && isCustomer ? `
            <button class="btn btn-secondary btn-full btn-sm" style="color:var(--c-danger)" onclick="if(confirm('${t('confirm')}?'))cancelOrder('${o.id}')">${t('cancel_order')}</button>
          ` : ''}
          ${o.provider_id && (isCustomer || isProvider) ? `
            <button class="btn btn-secondary btn-full" onclick="openChat('${o.id}')">${t('open_chat')}</button>
          ` : ''}
        </div>
      </div>
    </div>`;
}

async function openChat(orderId) {
  if (!db) return;
  const { data } = await db.from('conversations').select('*')
    .eq('order_id', orderId).contains('participants', [state.user.id]).limit(1).single();
  if (data) {
    state.currentConversation = data.id;
    await loadMessages(data.id);
    navigate('chat', { conversationId: data.id });
    setupRealtime();
  }
}

function renderChat() {
  const convId = state.routeParams.conversationId;
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="cleanupRealtime();state.currentConversation=null;goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('open_chat')}</div>
      </div>
      <div class="chat-container">
        <div class="chat-messages" id="chat-messages">
          ${state.currentMessages.map(m => `
            <div class="msg-bubble ${m.sender_id === state.user?.id ? 'msg-mine' : m.type === 'system' ? 'msg-system' : 'msg-theirs'}">
              ${m.text || ''}
              <div class="msg-time">${formatTime(m.created_at)}</div>
            </div>
          `).join('')}
        </div>
        <div class="chat-input-bar">
          <input class="chat-input" id="chat-input" placeholder="${t('type_message')}"
                 onkeydown="if(event.key==='Enter'){handleSendMessage('${convId}');event.preventDefault()}">
          <div class="chat-send" onclick="handleSendMessage('${convId}')">${icon('send', 20)}</div>
        </div>
      </div>
    </div>`;
}

async function handleSendMessage(convId) {
  const input = $('#chat-input');
  if (!input || !input.value.trim()) return;
  const text = input.value;
  input.value = '';
  await sendMessage(convId, text);
}

function renderExplore() {
  const providers = state.routeParams.exploreProviders || [];
  const routeInfo = state.routeParams.routeInfo;
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-title">${t('explore')}</div>
      </div>
      <div style="flex:1;position:relative;display:flex;flex-direction:column">
        <div id="explore-map" style="flex:1;min-height:200px"></div>
        <div class="chip-row" style="position:absolute;top:var(--space-sm);left:0;right:0;z-index:500">
          ${state.categories.map(c => `
            <div class="chip" onclick="filterExploreCategory('${c.id}')">${getCategoryName(c)}</div>
          `).join('')}
        </div>
        ${routeInfo ? `
          <div class="route-info">
            <div class="route-stats">
              ${routeInfo.driving ? `
                <div class="route-stat">
                  <div class="route-stat-value">${icon('car', 16)} ${routeInfo.driving.durationMin} ${t('min')}</div>
                  <div class="route-stat-label">${t('driving')} · ${routeInfo.driving.distanceKm} ${t('km')}</div>
                </div>
              ` : ''}
              ${routeInfo.walking ? `
                <div class="route-stat">
                  <div class="route-stat-value">${icon('footprints', 16)} ${routeInfo.walking.durationMin} ${t('min')}</div>
                  <div class="route-stat-label">${t('walking')} · ${routeInfo.walking.distanceKm} ${t('km')}</div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        <div style="max-height:35%;overflow-y:auto;background:var(--c-surface)">
          ${providers.length === 0 ? `
            <div style="padding:var(--space-lg);text-align:center;color:var(--c-text-secondary)">${t('no_orders_desc')}</div>
          ` : providers.map((p, idx) => `
            <div class="provider-card" onclick="navigate('provider-detail',{provider:state.routeParams.exploreProviders[${idx}]})">
              <div class="avatar">${getInitials(p.profiles?.display_name)}</div>
              <div class="provider-info">
                <div class="provider-name">${p.profiles?.display_name || t('provider')}</div>
                <div class="provider-meta">
                  <span>${icon('star', 14)} ${(p.avg_rating || 4).toFixed(1)}</span>
                  <span>${icon('map-pin', 14)} ${p.distanceKm || '—'} ${t('km')}</span>
                  <span>${icon('clock', 14)} ${Math.round(p.avg_response_minutes || 30)} ${t('min')}</span>
                </div>
              </div>
              <span class="badge badge-primary">${t('dispatch_score')}: ${((p.score || 0) * 100).toFixed(0)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ${renderCustomerTabs()}
    </div>`;
}

async function filterExploreCategory(categoryId) {
  state.routeParams.exploreCategory = categoryId;
  await loadExploreProviders();
}

async function loadExploreProviders() {
  if (!db) return;
  const { data: providers } = await db.from('provider_profiles')
    .select('*, profiles!inner(display_name, photo_url, kyc_status)')
    .eq('is_available', true).eq('is_verified', true);

  if (!providers || providers.length === 0) {
    state.routeParams.exploreProviders = [];
    render();
    return;
  }

  const userLat = state.routeParams.userLat || 24.7136;
  const userLng = state.routeParams.userLng || 46.6753;

  const { data: boosts } = await db.from('boosts').select('provider_id').eq('active', true);
  const boostedIds = new Set((boosts || []).map(b => b.provider_id));

  const scored = providers.map(p => {
    const s = calculateDispatchScore({ ...p, has_active_boost: boostedIds.has(p.id) }, userLat, userLng);
    return { ...p, ...s, has_active_boost: boostedIds.has(p.id) };
  });

  scored.sort((a, b) => b.score - a.score);
  state.routeParams.exploreProviders = scored.slice(0, CONFIG.DISPATCH_CAP);

  render();

  // Add markers to map
  setTimeout(() => {
    if (!exploreMap) return;
    scored.forEach(p => {
      if (p.location_lat && p.location_lng) {
        const marker = L.marker([p.location_lat, p.location_lng]).addTo(exploreMap);
        marker.bindPopup(`<b>${p.profiles?.display_name}</b><br>★ ${(p.avg_rating||4).toFixed(1)} · ${p.distanceKm} km`);
        marker.on('click', async () => {
          const routes = await showRouteOnMap(exploreMap, userLat, userLng, p.location_lat, p.location_lng);
          state.routeParams.routeInfo = routes;
          render();
        });
      }
    });
  }, 300);
}

function renderPayment() {
  const o = state.currentOrder;
  if (!o) return `<div class="screen active"><div class="spinner-center"><div class="spinner"></div></div></div>`;
  const country = state.profile?.country || 'SA';
  const countryConfig = CONFIG.SUPPORTED_COUNTRIES[country] || CONFIG.SUPPORTED_COUNTRIES.SA;
  const vatRate = countryConfig.vat;
  const subtotal = o.quoted_price || 0;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;
  const methods = [
    { id: 'card', label: t('card'), icon: 'credit-card', show: true },
    { id: 'apple_pay', label: t('apple_pay'), icon: 'smartphone', show: true },
    { id: 'mada', label: t('mada'), icon: 'landmark', show: country === 'SA' },
    { id: 'stc_pay', label: t('stc_pay'), icon: 'smartphone', show: country === 'SA' },
    { id: 'vipps', label: t('vipps'), icon: 'smartphone', show: country === 'NO' && state.flags.norway_market_enabled },
    { id: 'swish', label: t('swish'), icon: 'smartphone', show: country === 'SE' && state.flags.sweden_market_enabled },
    { id: 'cash', label: t('cash'), icon: 'banknote', show: state.flags.cash_payment_enabled }
  ].filter(m => m.show);

  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('payment')}</div>
      </div>
      <div class="content content-padded">
        <div class="card card-padded" style="margin-bottom:var(--space-md)">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-sm)">
            <span>${t('subtotal')}</span><span>${formatCurrency(subtotal, o.currency)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-sm);color:var(--c-text-secondary)">
            <span>${t('vat')} (${(vatRate * 100).toFixed(0)}%)</span><span>${formatCurrency(vat, o.currency)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-sm);color:var(--c-text-muted);font-size:var(--font-sm)">
            <span>${t('commission_fee')} (${(CONFIG.DEFAULT_COMMISSION_RATE * 100).toFixed(0)}%)</span><span>${formatCurrency(subtotal * CONFIG.DEFAULT_COMMISSION_RATE, o.currency)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:var(--font-lg);border-top:1px solid var(--c-border);padding-top:var(--space-sm)">
            <span>${t('total')}</span><span>${formatCurrency(total, o.currency)}</span>
          </div>
        </div>
        <h3 style="margin-bottom:var(--space-md)">${t('select_method')}</h3>
        ${methods.map(m => `
          <div class="card card-padded card-hover" style="margin-bottom:var(--space-sm);display:flex;align-items:center;gap:var(--space-md)"
               onclick="processPayment('${o.id}','${m.id}')">
            <span>${icon(m.icon, 24)}</span>
            <span style="flex:1;font-weight:600">${m.label}</span>
            <span style="color:var(--c-text-muted)">${icon('chevron-right', 18)}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderReview() {
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('rate_service')}</div>
      </div>
      <div class="content content-padded" style="text-align:center">
        <div class="avatar avatar-xl" style="margin:var(--space-xl) auto var(--space-md)">${icon('wrench', 32)}</div>
        <h3 style="margin-bottom:var(--space-lg)">${t('rate_provider')}</h3>
        <div class="stars" id="review-stars" style="justify-content:center;margin-bottom:var(--space-lg)">
          ${[1,2,3,4,5].map(n => `<div class="star" data-rating="${n}" onclick="setRating(${n})">★</div>`).join('')}
        </div>
        <div class="input-group" style="text-align:start">
          <textarea class="input" id="review-comment" placeholder="${t('leave_comment')}"></textarea>
        </div>
        <button class="btn btn-primary btn-full btn-lg" onclick="doSubmitReview()">${t('submit_review')}</button>
      </div>
    </div>`;
}

let selectedRating = 0;
function setRating(n) {
  selectedRating = n;
  $$('#review-stars .star').forEach((s, i) => s.classList.toggle('filled', i < n));
}

function doSubmitReview() {
  if (selectedRating === 0) { showToast('Please select a rating', 'error'); return; }
  const comment = $('#review-comment')?.value;
  handleSubmitReview(state.routeParams.orderId, selectedRating, comment);
}

function renderProfile() {
  const p = state.profile;
  if (!p) return '';
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-title">${t('profile')}</div>
      </div>
      <div class="content content-padded">
        <div style="text-align:center;margin-bottom:var(--space-xl)">
          <div class="avatar avatar-xl" style="margin:0 auto var(--space-md);cursor:pointer;position:relative" onclick="document.getElementById('avatar-upload').click()">
            ${p.photo_url ? `<img src="${p.photo_url}" alt="">` : getInitials(p.display_name)}
            <div style="position:absolute;bottom:0;right:0;width:24px;height:24px;border-radius:50%;background:var(--c-primary);color:#fff;display:flex;align-items:center;justify-content:center">${icon('camera', 14)}</div>
          </div>
          <input type="file" id="avatar-upload" accept="image/*" style="display:none" onchange="uploadAvatar(this.files[0]).then(()=>render())">
          <h2>${p.display_name}</h2>
          <p style="color:var(--c-text-secondary)">${p.email || ''}</p>
          <span class="badge badge-primary" style="margin-top:var(--space-sm)">${t(p.role)}</span>
        </div>
        <div class="settings-list">
          <div class="settings-item" onclick="navigate('edit-profile')">
            <span class="si-icon">${icon('edit', 20)}</span><span class="si-text">${t('edit_profile')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item" onclick="navigate('settings')">
            <span class="si-icon">${icon('bell', 20)}</span><span class="si-text">${t('notifications')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item">
            <span class="si-icon">${icon('globe', 20)}</span><span class="si-text">${t('language')}</span>
            <select class="input" style="width:auto;padding:6px 10px;font-size:var(--font-sm)" onchange="switchLanguage(this.value)">
              <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>العربية</option>
              <option value="no" ${state.lang === 'no' ? 'selected' : ''}>Norsk</option>
              <option value="sv" ${state.lang === 'sv' ? 'selected' : ''}>Svenska</option>
            </select>
          </div>
          <div class="settings-item" onclick="navigate('settings')">
            <span class="si-icon">${icon('lock', 20)}</span><span class="si-text">${t('security')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item" onclick="requestDataExport()">
            <span class="si-icon">${icon('download', 20)}</span><span class="si-text">${t('export_data')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item" style="color:var(--c-danger)" onclick="navigate('account-deletion')">
            <span class="si-icon">${icon('trash-2', 20)}</span><span class="si-text">${t('delete_account')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item" style="color:var(--c-danger)" onclick="if(confirm('${t('confirm')}?'))handleLogout()">
            <span class="si-icon">${icon('log-out', 20)}</span><span class="si-text">${t('logout')}</span>
          </div>
        </div>
        <div style="text-align:center;margin-top:var(--space-xl);color:var(--c-text-muted);font-size:var(--font-xs)">
          ${t('app_version')} 1.0.0
        </div>
      </div>
      ${state.profile?.role === 'customer' ? renderCustomerTabs() : renderProviderTabs()}
    </div>`;
}

function renderEditProfile() {
  const p = state.profile;
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('edit_profile')}</div>
      </div>
      <div class="content content-padded">
        <div class="input-group">
          <label class="input-label">${t('full_name')}</label>
          <input class="input" id="edit-name" value="${p?.display_name || ''}">
        </div>
        <div class="input-group">
          <label class="input-label">${t('phone')}</label>
          <input class="input" id="edit-phone" type="tel" value="${p?.phone || ''}" dir="ltr">
        </div>
        <button class="btn btn-primary btn-full" onclick="saveProfile()">${t('save')}</button>
      </div>
    </div>`;
}

async function saveProfile() {
  if (!db) return;
  const name = $('#edit-name')?.value;
  const phone = $('#edit-phone')?.value;
  const { error } = await db.from('profiles').update({
    display_name: name, phone: phone
  }).eq('id', state.user.id);
  if (error) { showToast(error.message, 'error'); return; }
  state.profile.display_name = name;
  state.profile.phone = phone;
  showToast(t('done'), 'success');
  goBack();
}

/* ============================================
   PROVIDER SCREENS
   ============================================ */
function renderProviderDashboard() {
  const pp = state.providerProfile;
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-title">${t('dashboard')}</div>
        <div class="header-action" onclick="navigate('provider-profile')">
          <div class="avatar avatar-sm">${getInitials(state.profile?.display_name)}</div>
        </div>
      </div>
      <div class="content content-padded">
        <div class="card card-padded" style="margin-bottom:var(--space-md);display:flex;align-items:center;justify-content:space-between">
          <span style="font-weight:600">${pp?.is_available ? t('available') : t('unavailable')}</span>
          <div class="toggle ${pp?.is_available ? 'on' : ''}" onclick="toggleAvailability()"></div>
        </div>
        <div class="stats-grid" style="margin-bottom:var(--space-lg)">
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">${t('pending_quotes')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">${t('active_jobs')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color:var(--c-success)">0</div>
            <div class="stat-label">${t('earned_today')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${pp?.avg_rating?.toFixed(1) || '4.0'}</div>
            <div class="stat-label">${icon('star', 14)} ${pp?.rating_count || 0} ${t('reviews_count')}</div>
          </div>
        </div>

        ${state.profile?.kyc_status !== 'approved' ? `
          <div class="kyc-banner ${state.profile?.kyc_status || 'not_submitted'}">
            <span>${state.profile?.kyc_status === 'pending' ? icon('loader', 24) : state.profile?.kyc_status === 'rejected' ? icon('x-circle', 24) : icon('clipboard', 24)}</span>
            <div style="flex:1">
              <div style="font-weight:600">${t('kyc_title')}</div>
              <div style="font-size:var(--font-sm)">${t('kyc_' + (state.profile?.kyc_status || 'not_submitted'))}</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="navigate('kyc')">${icon('arrow-right', 16)}</button>
          </div>
        ` : ''}

        <div class="section-header" style="padding-inline:0">
          <div class="section-title">${t('incoming_requests')}</div>
        </div>
        <div id="incoming-requests">
          <div class="empty-state">
            <div class="empty-icon">${icon('inbox', 48)}</div>
            <div class="empty-text">${t('no_orders_desc')}</div>
          </div>
        </div>
      </div>
      ${renderProviderTabs()}
    </div>`;
}

async function toggleAvailability() {
  if (!db || !state.providerProfile) return;
  const newVal = !state.providerProfile.is_available;
  await db.from('provider_profiles').update({ is_available: newVal }).eq('id', state.user.id);
  state.providerProfile.is_available = newVal;
  render();
}

function renderProviderOrders() {
  state.activeTab = 'provider-orders';
  return renderOrders();
}

function renderQuoteSubmit() {
  const o = state.currentOrder;
  if (!o) return `<div class="screen active"><div class="spinner-center"><div class="spinner"></div></div></div>`;
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('submit_quote')}</div>
      </div>
      <div class="content content-padded">
        <div class="card card-padded" style="margin-bottom:var(--space-md)">
          <h3 style="margin-bottom:var(--space-sm)">${o.title}</h3>
          <p style="color:var(--c-text-secondary);font-size:var(--font-sm)">${o.description}</p>
          <div style="margin-top:var(--space-sm);font-size:var(--font-sm);color:var(--c-text-secondary)">
            ${icon('map-pin', 14)} ${o.location_address || ''} · ${o.budget ? `${icon('dollar-sign', 14)} ${formatCurrency(o.budget, o.currency)}` : ''}
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">${t('your_price')} (${o.currency})</label>
          <input class="input" type="number" id="quote-price" min="1" placeholder="0.00" dir="ltr">
        </div>
        <div class="input-group">
          <label class="input-label">${t('estimated_hours')}</label>
          <input class="input" type="number" id="quote-hours" min="0.5" step="0.5" placeholder="2" dir="ltr">
        </div>
        <div class="input-group">
          <label class="input-label">${t('notes')}</label>
          <textarea class="input" id="quote-notes" placeholder="${t('notes_ph')}" maxlength="500"></textarea>
        </div>
        <button class="btn btn-primary btn-full btn-lg" id="send-quote-btn" ${state.loading.submitQuote ? 'disabled' : ''}
                onclick="doSubmitQuote('${o.id}')">
          ${state.loading.submitQuote ? '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>' : t('send_quote')}
        </button>
      </div>
    </div>`;
}

function doSubmitQuote(orderId) {
  const price = parseFloat($('#quote-price')?.value);
  const hours = parseFloat($('#quote-hours')?.value) || null;
  const notes = $('#quote-notes')?.value || null;
  if (!price || price <= 0) { showToast('Enter a valid price', 'error'); return; }
  submitQuote(orderId, price, hours, notes);
}

function renderEarnings() {
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-title">${t('earnings')}</div>
      </div>
      <div class="content content-padded">
        <div class="card card-padded" style="margin-bottom:var(--space-md);text-align:center">
          <div style="font-size:var(--font-sm);color:var(--c-text-secondary)">${t('total_balance')}</div>
          <div style="font-size:36px;font-weight:800;color:var(--c-success);margin:var(--space-sm) 0">${formatCurrency(0, 'SAR')}</div>
          <div style="display:flex;justify-content:center;gap:var(--space-xl);margin-bottom:var(--space-md)">
            <div><div style="font-weight:600">${formatCurrency(0, 'SAR')}</div><div style="font-size:var(--font-xs);color:var(--c-text-secondary)">${t('available_balance')}</div></div>
            <div><div style="font-weight:600">${formatCurrency(0, 'SAR')}</div><div style="font-size:var(--font-xs);color:var(--c-text-secondary)">${t('pending_balance')}</div></div>
          </div>
          <button class="btn btn-primary btn-full">${t('request_payout')}</button>
        </div>
        <div class="empty-state">
          <div class="empty-icon">${icon('wallet', 48)}</div>
          <div class="empty-text">${t('no_orders_desc')}</div>
        </div>
      </div>
      ${renderProviderTabs()}
    </div>`;
}

function renderKyc() {
  const status = state.profile?.kyc_status || 'not_submitted';
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('kyc_title')}</div>
      </div>
      <div class="content content-padded">
        <div class="kyc-banner ${status}">
          <span>${status === 'approved' ? icon('check-circle', 24) : status === 'pending' ? icon('loader', 24) : status === 'rejected' ? icon('x-circle', 24) : icon('clipboard', 24)}</span>
          <div>${t('kyc_' + status)}</div>
        </div>
        ${status === 'rejected' && state.profile?.kyc_rejection_reason ? `
          <div class="card card-padded" style="margin-bottom:var(--space-md);border-color:var(--c-danger)">
            <div style="font-weight:600;color:var(--c-danger);margin-bottom:var(--space-xs)">Rejection Reason:</div>
            <p style="color:var(--c-text-secondary)">${state.profile.kyc_rejection_reason}</p>
          </div>
        ` : ''}
        ${status !== 'approved' ? `
          <div class="card card-padded" style="margin-bottom:var(--space-md)">
            <div class="input-group">
              <label class="input-label">${t('national_id_front')}</label>
              <label class="btn btn-secondary btn-full" style="cursor:pointer">
                ${icon('camera', 16)} ${t('upload')}
                <input type="file" accept="image/*" style="display:none" id="kyc-front" onchange="handleKycFileSelect('front',this)">
              </label>
            </div>
            <div class="input-group">
              <label class="input-label">${t('national_id_back')}</label>
              <label class="btn btn-secondary btn-full" style="cursor:pointer">
                ${icon('camera', 16)} ${t('upload')}
                <input type="file" accept="image/*" style="display:none" id="kyc-back" onchange="handleKycFileSelect('back',this)">
              </label>
            </div>
            <div class="input-group">
              <label class="input-label">${t('trade_license')}</label>
              <label class="btn btn-secondary btn-full" style="cursor:pointer">
                ${icon('camera', 16)} ${t('upload')}
                <input type="file" accept="image/*" style="display:none" id="kyc-license" onchange="handleKycFileSelect('license',this)">
              </label>
            </div>
          </div>
          <button class="btn btn-primary btn-full btn-lg" onclick="submitKyc()">${t('submit_for_review')}</button>
        ` : ''}
      </div>
    </div>`;
}

async function submitKyc() {
  if (!db) return;
  if (!kycFiles.front || !kycFiles.back) {
    showToast(t('kyc_not_submitted'), 'error');
    return;
  }
  const urls = {};
  if (kycFiles.front) urls.id_front = await uploadKycDocument(kycFiles.front, 'id_front');
  if (kycFiles.back) urls.id_back = await uploadKycDocument(kycFiles.back, 'id_back');
  if (kycFiles.license) urls.trade_license = await uploadKycDocument(kycFiles.license, 'trade_license');

  await db.from('profiles').update({
    kyc_status: 'pending',
    kyc_documents: urls
  }).eq('id', state.user.id);
  state.profile.kyc_status = 'pending';
  kycFiles = { front: null, back: null, license: null };
  showToast(t('done'), 'success');
  render();
}

function renderProviderProfile() {
  const p = state.profile;
  const pp = state.providerProfile;
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-title">${t('profile')}</div>
      </div>
      <div class="content content-padded">
        <div style="text-align:center;margin-bottom:var(--space-lg)">
          <div class="avatar avatar-xl" style="margin:0 auto var(--space-md)">${getInitials(p?.display_name)}</div>
          <h2>${p?.display_name}</h2>
          <div class="stars" style="justify-content:center;margin:var(--space-sm) 0">
            ${[1,2,3,4,5].map(n => `<span class="star ${n <= Math.round(pp?.avg_rating || 4) ? 'filled' : ''}">★</span>`).join('')}
          </div>
          <span style="color:var(--c-text-secondary);font-size:var(--font-sm)">${pp?.avg_rating?.toFixed(1) || '4.0'} · ${pp?.rating_count || 0} ${t('reviews_count')}</span>
          <div style="margin-top:var(--space-sm)">
            <span class="badge badge-info">${icon('clock', 14)} ${t('response_time')} ${Math.round(pp?.avg_response_minutes || 30)} ${t('minutes')}</span>
          </div>
        </div>
        <div class="settings-list">
          <div class="settings-item" onclick="navigate('edit-profile')">
            <span class="si-icon">${icon('edit', 20)}</span><span class="si-text">${t('edit_profile')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item" onclick="navigate('kyc')">
            <span class="si-icon">${icon('clipboard', 20)}</span><span class="si-text">${t('kyc_title')}</span>
            <span class="badge badge-${p?.kyc_status === 'approved' ? 'success' : p?.kyc_status === 'pending' ? 'info' : 'warning'}">${t('kyc_' + (p?.kyc_status || 'not_submitted'))}</span>
          </div>
          <div class="settings-item">
            <span class="si-icon">${icon('globe', 20)}</span><span class="si-text">${t('language')}</span>
            <select class="input" style="width:auto;padding:6px 10px;font-size:var(--font-sm)" onchange="switchLanguage(this.value)">
              <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>العربية</option>
              <option value="no" ${state.lang === 'no' ? 'selected' : ''}>Norsk</option>
              <option value="sv" ${state.lang === 'sv' ? 'selected' : ''}>Svenska</option>
            </select>
          </div>
          ${state.flags.subscriptions_enabled ? `
            <div class="settings-item" onclick="navigate('subscription')">
              <span class="si-icon">${icon('crown', 20)}</span><span class="si-text">${t('subscription')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
            </div>
          ` : ''}
          <div class="settings-item" style="color:var(--c-danger)" onclick="if(confirm('${t('confirm')}?'))handleLogout()">
            <span class="si-icon">${icon('log-out', 20)}</span><span class="si-text">${t('logout')}</span>
          </div>
        </div>
        <div style="text-align:center;margin-top:var(--space-xl);color:var(--c-text-muted);font-size:var(--font-xs)">
          ${t('app_version')} 1.0.0
        </div>
      </div>
      ${renderProviderTabs()}
    </div>`;
}

/* ============================================
   ADMIN SCREENS
   ============================================ */
function renderAdminDashboard() {
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-title">${t('admin_panel')}</div>
        <div class="header-action" onclick="navigate('profile')">
          <div class="avatar avatar-sm">${getInitials(state.profile?.display_name)}</div>
        </div>
      </div>
      <div class="content content-padded">
        <div class="stats-grid" id="admin-stats-grid" style="margin-bottom:var(--space-lg)">
          <div class="stat-card"><div class="stat-value"><div class="spinner" style="margin:0 auto;width:16px;height:16px;border-width:2px"></div></div><div class="stat-label">${t('total_users')}</div></div>
          <div class="stat-card"><div class="stat-value"><div class="spinner" style="margin:0 auto;width:16px;height:16px;border-width:2px"></div></div><div class="stat-label">${t('active_orders')}</div></div>
          <div class="stat-card"><div class="stat-value"><div class="spinner" style="margin:0 auto;width:16px;height:16px;border-width:2px"></div></div><div class="stat-label">${t('pending_kyc')}</div></div>
          <div class="stat-card"><div class="stat-value"><div class="spinner" style="margin:0 auto;width:16px;height:16px;border-width:2px"></div></div><div class="stat-label">${t('open_disputes')}</div></div>
        </div>
        <div class="settings-list">
          <div class="settings-item" onclick="navigate('admin-users')">
            <span class="si-icon">${icon('users', 20)}</span><span class="si-text">${t('users')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item" onclick="navigate('admin-disputes')">
            <span class="si-icon">${icon('scale', 20)}</span><span class="si-text">${t('disputes')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item" onclick="navigate('admin-reports')">
            <span class="si-icon">${icon('bar-chart-2', 20)}</span><span class="si-text">${t('reports')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item" onclick="navigate('audit-logs')">
            <span class="si-icon">${icon('file-text', 20)}</span><span class="si-text">${t('audit_logs')}</span><span class="si-chevron">${icon('chevron-right', 18)}</span>
          </div>
          <div class="settings-item">
            <span class="si-icon">${icon('globe', 20)}</span><span class="si-text">${t('language')}</span>
            <select class="input" style="width:auto;padding:6px 10px;font-size:var(--font-sm)" onchange="switchLanguage(this.value)">
              <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>العربية</option>
              <option value="no" ${state.lang === 'no' ? 'selected' : ''}>Norsk</option>
              <option value="sv" ${state.lang === 'sv' ? 'selected' : ''}>Svenska</option>
            </select>
          </div>
          <div class="settings-item" style="color:var(--c-danger)" onclick="if(confirm('${t('confirm')}?'))handleLogout()">
            <span class="si-icon">${icon('log-out', 20)}</span><span class="si-text">${t('logout')}</span>
          </div>
        </div>
      </div>
    </div>`;
}

function renderAdminUsers() {
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="navigate('admin-dashboard')">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('users')}</div>
      </div>
      <div class="search-bar">
        <span class="search-icon">${icon('search', 18)}</span>
        <input id="admin-user-search" placeholder="${t('search_users')}" oninput="debouncedSearchUsers(this.value)">
      </div>
      <div class="content" id="admin-users-list">
        <div class="spinner-center"><div class="spinner"></div></div>
      </div>
    </div>`;
}

const debouncedSearchUsers = debounce(async (query) => {
  const users = await loadAdminUsers(query);
  renderAdminUsersList(users);
}, 300);

function renderAdminUsersList(users) {
  const el = $('#admin-users-list');
  if (!el) return;
  if (users.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('users', 48)}</div><div class="empty-text">${t('no_orders_desc')}</div></div>`;
    refreshIcons();
    return;
  }
  el.innerHTML = users.map(u => {
    const roleBadge = { customer: 'badge-neutral', provider: 'badge-primary', admin: 'badge-warning', superadmin: 'badge-danger' };
    return `
      <div class="order-card">
        <div style="display:flex;align-items:center;gap:var(--space-md)">
          <div class="avatar">${getInitials(u.display_name)}</div>
          <div style="flex:1">
            <div style="font-weight:600">${u.display_name}</div>
            <div style="font-size:var(--font-sm);color:var(--c-text-secondary)">${u.email || u.phone || ''}</div>
          </div>
          <span class="badge ${roleBadge[u.role] || 'badge-neutral'}">${t(u.role)}</span>
          ${u.is_banned ? `<span class="badge badge-danger">${t('banned')}</span>` : ''}
        </div>
        <div style="margin-top:var(--space-sm);display:flex;gap:var(--space-sm)">
          ${u.role === 'provider' && u.kyc_status === 'pending' ? `
            <button class="btn btn-success btn-sm" onclick="event.stopPropagation();adminKycDecision('${u.id}',true);this.closest('.order-card').remove()">${icon('check', 14)} KYC</button>
          ` : ''}
          ${!u.is_banned ?
            `<button class="btn btn-danger btn-sm" onclick="event.stopPropagation();adminBanUser('${u.id}',true,prompt('${t('ban_reason')}')).then(()=>debouncedSearchUsers(''))">${t('ban_user')}</button>` :
            `<button class="btn btn-success btn-sm" onclick="event.stopPropagation();adminBanUser('${u.id}',false).then(()=>debouncedSearchUsers(''))">${t('unban_user')}</button>`
          }
        </div>
      </div>`;
  }).join('');
}

function renderAdminDisputes() {
  const filter = state.routeParams.disputeFilter || 'all';
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="navigate('admin-dashboard')">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('disputes')}</div>
      </div>
      <div class="chip-row">
        ${['all','open','investigating','resolved'].map(f => `
          <div class="chip ${filter === f ? 'active' : ''}" onclick="state.routeParams.disputeFilter='${f}';render();loadAndRenderDisputes('${f}')">${t(f === 'all' ? 'all' : f)}</div>
        `).join('')}
      </div>
      <div class="content" id="admin-disputes-list">
        <div class="spinner-center"><div class="spinner"></div></div>
      </div>
    </div>`;
}

async function loadAndRenderDisputes(filter) {
  const disputes = await loadAdminDisputes(filter);
  const el = $('#admin-disputes-list');
  if (!el) return;
  if (disputes.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('scale', 48)}</div><div class="empty-text">${t('no_orders_desc')}</div></div>`;
    refreshIcons();
    return;
  }
  el.innerHTML = disputes.map(d => `
    <div class="order-card">
      <div class="order-card-top">
        <div class="order-card-title">${d.orders?.title || d.order_id}</div>
        <span class="badge ${d.status === 'open' ? 'badge-danger' : d.status === 'investigating' ? 'badge-warning' : 'badge-success'}">${t(d.status)}</span>
      </div>
      <p style="font-size:var(--font-sm);color:var(--c-text-secondary);margin-bottom:var(--space-sm)">${d.reason}</p>
      <div style="font-size:var(--font-xs);color:var(--c-text-muted)">${formatDate(d.created_at)}</div>
      ${d.status !== 'resolved' ? `
        <div style="margin-top:var(--space-sm);display:flex;gap:var(--space-sm);flex-wrap:wrap">
          <button class="btn btn-sm btn-primary" onclick="adminResolveDispute('${d.id}','customer_favor').then(()=>loadAndRenderDisputes('${filter}'))">${t('customer_favor')}</button>
          <button class="btn btn-sm btn-secondary" onclick="adminResolveDispute('${d.id}','provider_favor').then(()=>loadAndRenderDisputes('${filter}'))">${t('provider_favor')}</button>
          <button class="btn btn-sm btn-secondary" onclick="adminResolveDispute('${d.id}','settlement').then(()=>loadAndRenderDisputes('${filter}'))">${t('settlement')}</button>
        </div>
      ` : d.resolution ? `<div style="margin-top:var(--space-sm)"><span class="badge badge-info">${t(d.resolution)}</span></div>` : ''}
    </div>
  `).join('');
}

function renderAdminReports() {
  const activePeriod = state.routeParams.reportPeriod || 'this_month';
  const currency = CONFIG.SUPPORTED_COUNTRIES[state.profile?.country || 'SA']?.currency || 'SAR';
  const rd = state.routeParams.reportData || {};
  const dayLabels = state.lang === 'ar' ?
    ['سب','أح','اث','ثل','أر','خم','جم'] :
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="navigate('admin-dashboard')">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('reports')}</div>
      </div>
      <div class="content content-padded">
        <div class="chip-row" style="padding:0;margin-bottom:var(--space-md)">
          ${['this_month','last_month','three_months','this_year'].map(p => `
            <div class="chip ${activePeriod === p ? 'active' : ''}" onclick="loadReportPeriod('${p}')">${t(p)}</div>
          `).join('')}
        </div>
        <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-md)">
          <div class="input-group" style="flex:1;margin:0">
            <label class="input-label">${t('from_date')}</label>
            <input class="input" type="date" id="report-from" dir="ltr">
          </div>
          <div class="input-group" style="flex:1;margin:0">
            <label class="input-label">${t('to_date')}</label>
            <input class="input" type="date" id="report-to" dir="ltr">
          </div>
        </div>
        <div class="stats-grid" style="margin-bottom:var(--space-md)" id="report-stats">
          <div class="stat-card"><div class="stat-value">${formatCurrency(rd.totalRevenue || 0, currency)}</div><div class="stat-label">${t('revenue')}</div></div>
          <div class="stat-card"><div class="stat-value">${formatCurrency(rd.totalCommission || 0, currency)}</div><div class="stat-label">${t('commission')}</div></div>
          <div class="stat-card"><div class="stat-value">${rd.totalOrders || 0}</div><div class="stat-label">${t('total_orders_label')}</div></div>
          <div class="stat-card"><div class="stat-value">${formatCurrency(rd.avgOrderValue || 0, currency)}</div><div class="stat-label">${t('avg_order_value')}</div></div>
        </div>
        <div class="stats-grid" style="margin-bottom:var(--space-lg);grid-template-columns:repeat(2,1fr)">
          <div class="stat-card"><div class="stat-value">${rd.cancelledOrders || 0}</div><div class="stat-label">${t('cancelled')}</div></div>
          <div class="stat-card"><div class="stat-value">${rd.disputeRate || 0}%</div><div class="stat-label">${t('disputes')}</div></div>
          <div class="stat-card"><div class="stat-value">${rd.newUsers || 0}</div><div class="stat-label">${t('total_users')}</div></div>
          <div class="stat-card"><div class="stat-value">${rd.activeProviders || 0}</div><div class="stat-label">${t('provider')}</div></div>
        </div>
        <div class="card card-padded">
          <h3 style="margin-bottom:var(--space-md)">${t('revenue')}</h3>
          <div class="bar-chart">
            ${(rd.weeklyData || [0,0,0,0,0,0,0]).map((val, i) => {
              const maxVal = Math.max(...(rd.weeklyData || [1]));
              const h = maxVal > 0 ? (val / maxVal * 100) : 5;
              return `<div class="bar-col"><div class="bar-fill" style="height:${Math.max(h, 4)}%"></div><div class="bar-label">${dayLabels[i]}</div></div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

async function loadReportPeriod(period) {
  state.routeParams.reportPeriod = period;
  const now = new Date();
  let fromDate, toDate;

  if (period === 'this_month') {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    toDate = now.toISOString().split('T')[0];
  } else if (period === 'last_month') {
    fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    toDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
  } else if (period === 'three_months') {
    fromDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];
    toDate = now.toISOString().split('T')[0];
  } else {
    fromDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    toDate = now.toISOString().split('T')[0];
  }

  const data = await loadReportData(fromDate, toDate);
  state.routeParams.reportData = data;
  render();
}

/* ============================================
   SETTINGS SCREEN
   ============================================ */
function renderSettings() {
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('notifications')}</div>
      </div>
      <div class="content content-padded">
        <div class="card card-padded" style="margin-bottom:var(--space-md)">
          <button class="btn btn-primary btn-full" onclick="requestNotificationPermission().then(ok => showToast(ok ? t('done') : 'Permission denied', ok ? 'success' : 'error'))">
            ${icon('bell', 18)} ${t('notif_enable')}
          </button>
        </div>
        <div class="settings-list">
          <div class="settings-item">
            <span class="si-icon">${icon('mail', 20)}</span><span class="si-text">${t('notif_orders')}</span>
            <div class="toggle on" onclick="this.classList.toggle('on')"></div>
          </div>
          <div class="settings-item">
            <span class="si-icon">${icon('message-circle', 20)}</span><span class="si-text">${t('notif_chat')}</span>
            <div class="toggle on" onclick="this.classList.toggle('on')"></div>
          </div>
          <div class="settings-item">
            <span class="si-icon">${icon('megaphone', 20)}</span><span class="si-text">${t('notif_promo')}</span>
            <div class="toggle" onclick="this.classList.toggle('on')"></div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderDispute() {
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('open_dispute')}</div>
      </div>
      <div class="content content-padded">
        <div class="input-group">
          <label class="input-label">${t('description')}</label>
          <textarea class="input" id="dispute-reason" placeholder="${t('description_ph')}"></textarea>
        </div>
        <button class="btn btn-danger btn-full btn-lg" onclick="doOpenDispute()">${t('open_dispute')}</button>
      </div>
    </div>`;
}

function doOpenDispute() {
  const reason = $('#dispute-reason')?.value;
  if (!reason || reason.length < 10) { showToast('Please describe the issue', 'error'); return; }
  handleOpenDispute(state.routeParams.orderId, reason);
}

/* ============================================
   LANGUAGE
   ============================================ */
function switchLanguage(lang) {
  state.lang = lang;
  const dir = I18N[lang]?.dir || 'ltr';
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  localStorage.setItem('workfix_lang', lang);
  render();
}

function detectLanguage() {
  const saved = localStorage.getItem('workfix_lang');
  if (saved && I18N[saved]) return saved;
  const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (browserLang.startsWith('ar')) return 'ar';
  if (browserLang.startsWith('nb') || browserLang.startsWith('nn') || browserLang.startsWith('no')) return 'no';
  if (browserLang.startsWith('sv')) return 'sv';
  return 'en';
}

/* ============================================
   MAP HELPERS
   ============================================ */
let orderMap = null;
let orderMarker = null;
let exploreMap = null;

function initOrderMap() {
  setTimeout(() => {
    const el = document.getElementById('order-map');
    if (!el || orderMap) return;
    orderMap = L.map('order-map').setView([24.7136, 46.6753], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM'
    }).addTo(orderMap);
    orderMap.on('click', e => {
      if (orderMarker) orderMap.removeLayer(orderMarker);
      orderMarker = L.marker(e.latlng).addTo(orderMap);
      const addrInput = $('#order-address');
      if (addrInput) addrInput.value = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
      state.routeParams.lat = e.latlng.lat;
      state.routeParams.lng = e.latlng.lng;
    });
  }, 200);
}

function initExploreMap() {
  setTimeout(() => {
    const el = document.getElementById('explore-map');
    if (!el || exploreMap) return;
    exploreMap = L.map('explore-map').setView([24.7136, 46.6753], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM'
    }).addTo(exploreMap);
  }, 200);
}

function useMyLocation() {
  if (!navigator.geolocation) { showToast('Geolocation not supported', 'error'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    state.routeParams.lat = lat;
    state.routeParams.lng = lng;
    if (orderMap) {
      orderMap.setView([lat, lng], 15);
      if (orderMarker) orderMap.removeLayer(orderMarker);
      orderMarker = L.marker([lat, lng]).addTo(orderMap);
    }
    const addrInput = $('#order-address');
    if (addrInput) addrInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }, () => showToast('Location access denied', 'error'));
}

/* ============================================
   PHONE VERIFY SCREEN (OTP)
   ============================================ */
let otpTimer = 59;
let otpInterval = null;

function renderPhoneVerify() {
  const phone = state.routeParams.phone || '+966...';
  return `
    <div class="screen active" style="justify-content:center">
      <div class="content-padded" style="max-width:400px;margin:0 auto;width:100%;text-align:center">
        <div style="margin-bottom:var(--space-md)">${icon('smartphone', 48)}</div>
        <h2 style="margin-bottom:var(--space-sm)">${t('otp_title')}</h2>
        <p style="color:var(--c-text-secondary);margin-bottom:var(--space-lg)">${t('otp_subtitle')} ${phone}</p>
        <div class="otp-row" id="otp-row">
          ${[0,1,2,3,4,5].map(i => `
            <input class="otp-cell" type="text" inputmode="numeric" maxlength="1" id="otp-${i}"
                   oninput="handleOtpInput(${i})" onkeydown="handleOtpKeydown(event,${i})">
          `).join('')}
        </div>
        <div id="otp-timer" style="color:var(--c-text-secondary);margin-bottom:var(--space-lg)">
          ${t('otp_resend_in')} <span id="otp-countdown">0:59</span>
        </div>
        <button class="btn btn-ghost btn-full" id="otp-resend-btn" disabled onclick="resendOtp()">${t('otp_resend')}</button>
        <button class="btn btn-secondary btn-full" style="margin-top:var(--space-sm)" onclick="goBack()">${t('back')}</button>
      </div>
    </div>`;
}

function handleOtpInput(idx) {
  const cell = $(`#otp-${idx}`);
  if (!cell) return;
  cell.value = cell.value.replace(/[^0-9]/g, '').slice(-1);
  if (cell.value && idx < 5) $(`#otp-${idx + 1}`)?.focus();
  if (idx === 5 && cell.value) verifyOtp();
}

function handleOtpKeydown(e, idx) {
  if (e.key === 'Backspace' && !e.target.value && idx > 0) {
    $(`#otp-${idx - 1}`)?.focus();
  }
}

function getOtpValue() {
  return [0,1,2,3,4,5].map(i => $(`#otp-${i}`)?.value || '').join('');
}

async function verifyOtp() {
  if (!db) return;
  const code = getOtpValue();
  if (code.length !== 6) return;

  const { data, error } = await db.auth.verifyOtp({
    phone: state.routeParams.phone,
    token: code,
    type: 'sms'
  });

  if (error) {
    showToast(t('otp_error'), 'error');
    $$('.otp-cell').forEach(c => c.classList.add('error'));
    setTimeout(() => $$('.otp-cell').forEach(c => c.classList.remove('error')), 600);
    return;
  }

  await loadUserProfile();
  navigate(getDefaultRoute());
}

function startOtpTimer() {
  otpTimer = 59;
  clearInterval(otpInterval);
  otpInterval = setInterval(() => {
    otpTimer--;
    const el = $('#otp-countdown');
    if (el) el.textContent = `0:${otpTimer.toString().padStart(2, '0')}`;
    if (otpTimer <= 0) {
      clearInterval(otpInterval);
      const btn = $('#otp-resend-btn');
      if (btn) btn.disabled = false;
    }
  }, 1000);
}

async function resendOtp() {
  if (!db) return;
  const phone = state.routeParams.phone;
  if (!phone) return;
  await db.auth.signInWithOtp({ phone });
  startOtpTimer();
  const btn = $('#otp-resend-btn');
  if (btn) btn.disabled = true;
  showToast(t('done'), 'success');
}

/* ============================================
   SUBSCRIPTION SCREEN
   ============================================ */
function renderSubscription() {
  const currentTier = state.providerProfile?.subscription_tier || 'free';
  const isYearly = state.routeParams.yearly || false;
  const currency = CONFIG.SUPPORTED_COUNTRIES[state.profile?.country || 'SA']?.currency || 'SAR';

  const plans = [
    {
      id: 'free', name: t('free_tier'), price: 0, priceYearly: 0,
      features: [t('plan_feature_basic'), t('plan_feature_standard')],
      popular: false
    },
    {
      id: 'pro', name: t('pro_tier'), price: 49, priceYearly: 490,
      features: [t('plan_feature_visibility'), t('plan_feature_priority'), t('plan_feature_basic')],
      popular: true
    },
    {
      id: 'business', name: t('business_tier'), price: 149, priceYearly: 1490,
      features: [t('plan_feature_analytics'), t('plan_feature_agency'), t('plan_feature_visibility'), t('plan_feature_priority')],
      popular: false
    }
  ];

  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('subscription_title')}</div>
      </div>
      <div class="content content-padded">
        <div style="display:flex;justify-content:center;gap:var(--space-sm);margin-bottom:var(--space-lg)">
          <div class="chip ${!isYearly ? 'active' : ''}" onclick="state.routeParams.yearly=false;render()">${t('monthly')}</div>
          <div class="chip ${isYearly ? 'active' : ''}" onclick="state.routeParams.yearly=true;render()">
            ${t('yearly')} <span style="color:var(--c-success);font-size:var(--font-xs)">— ${t('save_percent')} 17%</span>
          </div>
        </div>
        ${plans.map(plan => `
          <div class="plan-card ${currentTier === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}" style="margin-bottom:var(--space-md)"
               ${currentTier !== plan.id && plan.id !== 'free' ? `onclick="subscribeToPlan('${plan.id}','${isYearly ? 'yearly' : 'monthly'}')"` : ''}>
            <h3>${plan.name}</h3>
            <div class="plan-price">
              ${plan.price === 0 ? t('free_tier') : formatCurrency(isYearly ? plan.priceYearly : plan.price, currency)}
            </div>
            <div class="plan-period">${plan.price > 0 ? (isYearly ? '/' + t('yearly') : '/' + t('monthly')) : ''}</div>
            <ul class="plan-features">
              ${plan.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            ${currentTier === plan.id ?
              `<div class="badge badge-success">${t('current_plan')}</div>` :
              plan.id !== 'free' ? `<button class="btn btn-primary btn-full">${t('subscribe')}</button>` : ''
            }
          </div>
        `).join('')}
      </div>
    </div>`;
}

async function subscribeToPlan(tier, period) {
  if (!db) return;
  if (!state.flags.subscriptions_enabled) {
    showToast('Subscriptions coming soon', 'info');
    return;
  }
  const priceMap = { pro_monthly: 49, pro_yearly: 490, business_monthly: 149, business_yearly: 1490 };
  const price = priceMap[`${tier}_${period}`] || 0;
  const currency = CONFIG.SUPPORTED_COUNTRIES[state.profile?.country || 'SA']?.currency || 'SAR';
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + (period === 'yearly' ? 12 : 1));

  const { error } = await db.from('subscriptions').insert({
    provider_id: state.user.id,
    tier, period, amount: price, currency,
    status: 'active',
    current_period_end: periodEnd.toISOString()
  });

  if (error) { showToast(error.message, 'error'); return; }
  showToast(t('done'), 'success');
  goBack();
}

/* ============================================
   BOOST SCREEN
   ============================================ */
function renderBoost() {
  const currency = CONFIG.SUPPORTED_COUNTRIES[state.profile?.country || 'SA']?.currency || 'SAR';
  const activeBoost = state.routeParams.activeBoost;

  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('boost_title')}</div>
      </div>
      <div class="content content-padded">
        <div style="text-align:center;margin-bottom:var(--space-lg)">
          <div style="margin-bottom:var(--space-md)">${icon('rocket', 48)}</div>
          <h2 style="margin-bottom:var(--space-sm)">${t('boost_title')}</h2>
          <p style="color:var(--c-text-secondary)">${t('boost_desc')}</p>
          <div class="badge badge-info" style="margin-top:var(--space-sm)">${t('boost_multiplier')}</div>
        </div>

        ${activeBoost ? `
          <div class="card card-padded" style="margin-bottom:var(--space-lg);border-color:var(--c-success);background:var(--c-success-light)">
            <div style="display:flex;align-items:center;gap:var(--space-md)">
              <span>${icon('check-circle', 24)}</span>
              <div>
                <div style="font-weight:600;color:var(--c-success)">${t('boost_active')}</div>
                <div style="font-size:var(--font-sm);color:var(--c-text-secondary)">
                  ${t('boost_expires')}: ${formatDate(activeBoost.expires_at)}
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        ${[7, 14, 30].map(d => {
          const price = CONFIG.BOOST_PLANS[d].price;
          return `
            <div class="card card-padded card-hover" style="margin-bottom:var(--space-sm);display:flex;align-items:center;justify-content:space-between"
                 onclick="purchaseBoost(${d})">
              <div>
                <div style="font-weight:600">${d} ${t('days')}</div>
                <div style="font-size:var(--font-sm);color:var(--c-text-secondary)">${t('boost_multiplier')}</div>
              </div>
              <div style="text-align:end">
                <div style="font-weight:700;color:var(--c-primary)">${formatCurrency(price, currency)}</div>
                <button class="btn btn-primary btn-sm" style="margin-top:var(--space-xs)">${t('buy_boost')}</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
}

async function purchaseBoost(duration) {
  if (!db) return;
  if (!state.flags.boost_enabled) {
    showToast('Boosts coming soon', 'info');
    return;
  }
  const price = CONFIG.BOOST_PLANS[duration].price;
  const currency = CONFIG.SUPPORTED_COUNTRIES[state.profile?.country || 'SA']?.currency || 'SAR';
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + duration);

  const { error } = await db.from('boosts').insert({
    provider_id: state.user.id,
    duration, price, currency,
    active: true,
    expires_at: expiresAt.toISOString()
  });

  if (error) { showToast(error.message, 'error'); return; }
  showToast(t('done'), 'success');
  state.routeParams.activeBoost = { expires_at: expiresAt.toISOString() };
  render();
}

/* ============================================
   PROVIDER DETAIL SCREEN (from Explore)
   ============================================ */
function renderProviderDetail() {
  const p = state.routeParams.provider;
  if (!p) return `<div class="screen active"><div class="spinner-center"><div class="spinner"></div></div></div>`;

  const rating = p.avg_rating || CONFIG.BAYESIAN_M;
  const ratingCount = p.rating_count || 0;

  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('provider_detail')}</div>
      </div>
      <div class="content content-padded">
        <div style="text-align:center;margin-bottom:var(--space-lg)">
          <div class="avatar avatar-xl" style="margin:0 auto var(--space-md)">
            ${p.profiles?.photo_url ? `<img src="${p.profiles.photo_url}" alt="">` : getInitials(p.profiles?.display_name)}
          </div>
          <h2>${p.profiles?.display_name || t('provider')}</h2>
          <div class="stars" style="justify-content:center;margin:var(--space-sm) 0">
            ${[1,2,3,4,5].map(n => `<span class="star ${n <= Math.round(rating) ? 'filled' : ''}">★</span>`).join('')}
          </div>
          <span style="color:var(--c-text-secondary);font-size:var(--font-sm)">
            ${rating.toFixed(1)} · ${ratingCount} ${t('reviews_count')}
          </span>
          ${p.bio ? `<p style="color:var(--c-text-secondary);margin-top:var(--space-md);font-size:var(--font-sm)">${p.bio}</p>` : ''}
        </div>

        <div class="stats-grid" style="margin-bottom:var(--space-lg)">
          <div class="stat-card">
            <div class="stat-value">${p.completed_orders || 0}</div>
            <div class="stat-label">${t('completed_jobs')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Math.round(p.avg_response_minutes || 30)}</div>
            <div class="stat-label">${t('response_time')} (${t('min')})</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${((p.acceptance_rate || 0.8) * 100).toFixed(0)}%</div>
            <div class="stat-label">${t('accept')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${p.distanceKm || '—'}</div>
            <div class="stat-label">${t('distance')} (${t('km')})</div>
          </div>
        </div>

        ${p.service_categories?.length ? `
          <div style="margin-bottom:var(--space-lg)">
            <h3 style="margin-bottom:var(--space-sm)">${t('service_categories')}</h3>
            <div style="display:flex;gap:var(--space-sm);flex-wrap:wrap">
              ${p.service_categories.map(c => `<span class="badge badge-primary">${c}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${p.hourly_rate ? `
          <div class="card card-padded" style="margin-bottom:var(--space-md)">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:600">${t('hourly_rate')}</span>
              <span style="font-weight:700;font-size:var(--font-lg);color:var(--c-primary)">
                ${formatCurrency(p.hourly_rate, CONFIG.SUPPORTED_COUNTRIES[state.profile?.country || 'SA']?.currency || 'SAR')}/h
              </span>
            </div>
          </div>
        ` : ''}

        <div style="font-size:var(--font-xs);color:var(--c-text-muted);text-align:center;margin-bottom:var(--space-md)">
          ${t('member_since')} ${formatDate(p.created_at)}
        </div>

        <button class="btn btn-primary btn-full btn-lg" onclick="navigate('create-order')">${t('request_service')}</button>
      </div>
    </div>`;
}

/* ============================================
   ADMIN AUDIT LOG SCREEN
   ============================================ */
function renderAuditLogs() {
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="navigate('admin-dashboard')">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('audit_logs')}</div>
      </div>
      <div class="content" id="audit-logs-list">
        <div class="spinner-center"><div class="spinner"></div></div>
      </div>
    </div>`;
}

async function loadAndRenderAuditLogs() {
  const logs = await loadAuditLogs();
  const el = $('#audit-logs-list');
  if (!el) return;
  if (logs.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('file-text', 48)}</div><div class="empty-text">${t('no_logs')}</div></div>`;
    refreshIcons();
    return;
  }
  el.innerHTML = logs.map(log => `
    <div class="audit-row">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="audit-action">${log.action}</span>
        <span class="audit-time">${formatDate(log.created_at)} ${formatTime(log.created_at)}</span>
      </div>
      <div class="audit-actor">${log.actor_id === 'system' ? icon('cpu', 14) + ' System' : icon('user', 14) + ' ' + log.actor_id.slice(0, 8)}</div>
      ${log.payload && Object.keys(log.payload).length > 0 ?
        `<div style="font-size:var(--font-xs);color:var(--c-text-muted);margin-top:2px;word-break:break-all">${JSON.stringify(log.payload)}</div>` : ''}
    </div>
  `).join('');
}

/* ============================================
   ACCOUNT DELETION SCREEN
   ============================================ */
function renderAccountDeletion() {
  return `
    <div class="screen active">
      <div class="header">
        <div class="header-back" onclick="goBack()">${icon('arrow-left', 20)}</div>
        <div class="header-title">${t('account_deletion')}</div>
      </div>
      <div class="content content-padded">
        <div style="text-align:center;margin-bottom:var(--space-lg)">
          <div style="margin-bottom:var(--space-md)">${icon('alert-triangle', 48)}</div>
          <h2 style="color:var(--c-danger);margin-bottom:var(--space-md)">${t('account_deletion')}</h2>
          <p style="color:var(--c-text-secondary)">${t('delete_warning')}</p>
        </div>
        <div class="input-group">
          <label class="input-label">${t('delete_confirm')}</label>
          <input class="input" id="delete-confirm-input" placeholder="DELETE" dir="ltr">
        </div>
        <button class="btn btn-danger btn-full btn-lg" onclick="doDeleteAccount()">${t('delete_account')}</button>
      </div>
    </div>`;
}

function doDeleteAccount() {
  const val = $('#delete-confirm-input')?.value;
  if (val !== 'DELETE') { showToast(t('delete_confirm'), 'error'); return; }
  requestAccountDeletion();
}

