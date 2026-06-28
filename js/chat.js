/* ============================================
   CHAT FUNCTIONS
   ============================================ */
// Chat
async function loadConversations() {
  if (!state.user) return;
  const { data } = await db.from('conversations').select('*')
    .contains('participants', [state.user.id]).order('last_message_at', { ascending: false });
  state.conversations = data || [];
}

async function loadMessages(convId) {
  const { data } = await db.from('messages').select('*')
    .eq('conversation_id', convId).order('created_at', { ascending: true }).limit(50);
  state.currentMessages = data || [];
}

async function sendMessage(convId, text) {
  if (!text.trim()) return;
  const { error } = await db.from('messages').insert({
    conversation_id: convId, sender_id: state.user.id, text: text.trim(), type: 'text'
  });
  if (error) { showToast(error.message, 'error'); return; }
  await db.from('conversations').update({
    last_message: text.trim(), last_message_at: new Date().toISOString()
  }).eq('id', convId);
}

/* ============================================
   REALTIME SUBSCRIPTIONS
   ============================================ */
let realtimeChannels = [];

function setupRealtime() {
  cleanupRealtime();
  if (!state.user) return;

  // Listen to messages in current conversation
  if (state.currentConversation) {
    const ch = db.channel(`messages:${state.currentConversation}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${state.currentConversation}`
      }, payload => {
        state.currentMessages.push(payload.new);
        render();
        const msgList = $('.chat-messages');
        if (msgList) msgList.scrollTop = msgList.scrollHeight;
      }).subscribe();
    realtimeChannels.push(ch);
  }

  // Listen to order updates
  const orderCh = db.channel('order-updates')
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'orders'
    }, payload => {
      const idx = state.orders.findIndex(o => o.id === payload.new.id);
      if (idx >= 0) { state.orders[idx] = { ...state.orders[idx], ...payload.new }; render(); }
      if (state.currentOrder?.id === payload.new.id) {
        state.currentOrder = { ...state.currentOrder, ...payload.new };
        render();
      }
    }).subscribe();
  realtimeChannels.push(orderCh);
}

function cleanupRealtime() {
  realtimeChannels.forEach(ch => db.removeChannel(ch));
  realtimeChannels = [];
}
