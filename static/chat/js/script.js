/**
 * Aria AI — script.js
 * History is now server-side. JS only handles display and API calls.
 * CSRF_TOKEN, CHAT_URL, IS_AUTH, USERNAME injected from Django template.
 */

// ─── URLs ─────────────────────────────────────────────────────────────────────
// These match exactly what we defined in chat/urls.py
const URLS = {
  send:               '/send/',
  conversationList:   '/conversations/',
  conversationNew:    '/conversation/new/',
  conversationDelete: (id) => `/conversation/${id}/delete/`,
};

// ─── State ────────────────────────────────────────────────────────────────────
// activeId is the only state we keep — just which conversation is open
let activeId  = null;
let isLoading = false;

// ─── DOM ──────────────────────────────────────────────────────────────────────
const sidebar    = document.getElementById('sidebar');
const overlay    = document.getElementById('overlay');
const menuBtn    = document.getElementById('menuBtn');
const sbClose    = document.getElementById('sbClose');
const sbNewChat  = document.getElementById('sbNewChat');
const sbHistory  = document.getElementById('sbHistory');
const sbClearAll = document.getElementById('sbClearAll');
const newChatBtn = document.getElementById('newChatBtn');
const clearBtn   = document.getElementById('clearBtn');
const messagesEl = document.getElementById('messages');
const inputEl    = document.getElementById('msg-input');
const sendBtnEl  = document.getElementById('send-btn');
const charCountEl= document.getElementById('char-count');
const toastEl    = document.getElementById('toast');

// ─── Boot ─────────────────────────────────────────────────────────────────────
// When page loads, fetch conversations from server
document.addEventListener('DOMContentLoaded', () => {
  initSidebarProfile();
  loadConversationList();
  bindEvents();

  // Clear any old localStorage from the previous version
  localStorage.removeItem('aria_conversations');
});

// ─── Sidebar profile ──────────────────────────────────────────────────────────
function initSidebarProfile() {
  const avatarEl = document.getElementById('sbAvatar');
  if (typeof USERNAME !== 'undefined' && USERNAME) {
    avatarEl.textContent = USERNAME.charAt(0).toUpperCase();
  }
}

// ─── Sidebar open/close ───────────────────────────────────────────────────────
function openSidebar()  {
  sidebar.classList.add('open');
  overlay.classList.add('show');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

// ─── Load conversation list from server ───────────────────────────────────────
// Called on page load and after any create/delete
async function loadConversationList() {
  try {
    const res  = await fetch(URLS.conversationList);
    const data = await res.json();
    renderSidebarHistory(data.conversations);
  } catch (err) {
    console.error('Failed to load conversations:', err);
  }
}

// ─── Render sidebar history ───────────────────────────────────────────────────
function renderSidebarHistory(conversations) {
  sbHistory.innerHTML = '';

  if (!conversations.length) {
    sbHistory.innerHTML = '<li class="sb-empty-history">هنوز گفتگویی ندارید.<br>یک چت جدید شروع کنید!</li>';
    return;
  }

  conversations.forEach(conv => {
    const li = document.createElement('li');
    li.className = 'sb-history-item' + (conv.id === activeId ? ' active' : '');

    li.innerHTML = `
      <span class="sb-history-icon">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </span>
      <span class="sb-history-text">${escHtml(conv.title)}</span>
      <button class="sb-history-del" data-id="${conv.id}" title="حذف">✕</button>
    `;

    // Click the row → load that conversation
    li.addEventListener('click', (e) => {
      if (e.target.classList.contains('sb-history-del')) return;
      loadConversation(conv.id);
      closeSidebar();
    });

    // Click the ✕ → delete it
    li.querySelector('.sb-history-del').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteConversation(conv.id);
    });

    sbHistory.appendChild(li);
  });
}

// ─── Load a specific conversation ─────────────────────────────────────────────
// When user clicks a history item — fetch its messages from the server
async function loadConversation(id) {
  activeId = id;

  try {
    // Fetch the messages for this conversation
    const res  = await fetch(`/conversation/${id}/messages/`);
    const data = await res.json();

    // Clear the screen and render each message
    messagesEl.innerHTML = '';
    data.messages.forEach(msg => renderBubble(msg.role, msg.content, false));
    scrollBottom();

  } catch (err) {
    showToast('خطا در بارگذاری گفتگو');
  }

  // Highlight the active item in sidebar
  loadConversationList();
}

// ─── Delete a conversation ────────────────────────────────────────────────────
async function deleteConversation(id) {
  try {
    await fetch(URLS.conversationDelete(id), {
      method:  'DELETE',
      headers: { 'X-CSRFToken': CSRF_TOKEN },
    });

    // If we deleted the active conversation, go back to welcome screen
    if (activeId === id) resetToWelcome();

    // Refresh the sidebar
    loadConversationList();

  } catch (err) {
    showToast('خطا در حذف گفتگو');
  }
}

// ─── Clear all conversations ──────────────────────────────────────────────────
async function clearAllConversations() {
  if (!confirm('همه گفتگوها حذف شوند؟')) return;

  try {
    // Delete each one — we could also make a bulk-delete endpoint later
    const res  = await fetch(URLS.conversationList);
    const data = await res.json();

    await Promise.all(
      data.conversations.map(conv =>
        fetch(URLS.conversationDelete(conv.id), {
          method:  'DELETE',
          headers: { 'X-CSRFToken': CSRF_TOKEN },
        })
      )
    );

    resetToWelcome();
    loadConversationList();
    closeSidebar();

  } catch (err) {
    showToast('خطا در پاک کردن گفتگوها');
  }
}

// ─── Send message ─────────────────────────────────────────────────────────────
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || isLoading) return;

  // Show user message immediately — don't wait for server
  renderBubble('user', text);

  // Clear input
  isLoading = true;
  sendBtnEl.disabled = true;
  inputEl.value = '';
  autoResize();
  charCountEl.textContent = '0 / 4000';

  showTyping();

  try {
    const res = await fetch(URLS.send, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken':  CSRF_TOKEN,
      },
      body: JSON.stringify({
        message:text,
        // activeId is null on first message — Django creates a new conversation
        conversation_id: activeId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `خطای سرور: ${res.status}`);
    }

    const data = await res.json();

    // Server returns the conversation_id — save it for next message
    // This is how first message → new conversation works
    activeId = data.conversation_id;

    removeTyping();
    renderBubble('assistant', data.reply);

    // Refresh sidebar so new/updated conversation appears
    loadConversationList();

  } catch (err) {
    removeTyping();
    showToast('⚠️ ' + err.message);
  } finally {
    isLoading = false;
    sendBtnEl.disabled = false;
    inputEl.focus();
  }
}

// ─── Welcome screen ───────────────────────────────────────────────────────────
function resetToWelcome() {
  activeId = null;
  messagesEl.innerHTML = `
    <div class="welcome" id="welcome">
      <div class="welcome-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2>سلام! من <span>Aria</span> هستم</h2>
      <p>دستیار هوشمند شما. هر سوالی داری بپرس — از کد نویسی تا مشاوره و هر چیز دیگه‌ای.</p>
      <div class="suggestions">
        <button class="suggestion" onclick="useSuggestion(this)">یه کد پایتون بنویس</button>
        <button class="suggestion" onclick="useSuggestion(this)">برام توضیح بده Django چیه</button>
        <button class="suggestion" onclick="useSuggestion(this)">یه ایده پروژه بده</button>
        <button class="suggestion" onclick="useSuggestion(this)">فرق REST و GraphQL چیه؟</button>
      </div>
    </div>`;
  inputEl.value = '';
  autoResize();
  charCountEl.textContent = '0 / 4000';
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function removeWelcome() {
  const w = document.getElementById('welcome');
  if (w) w.remove();
}

function renderBubble(role, text, animate = true) {
  removeWelcome();

  const row = document.createElement('div');
  row.className = `msg-row ${role === 'user' ? 'user' : ''}`;
  if (!animate) row.style.animation = 'none';

  const avatarHTML = role === 'user'
    ? `<div class="avatar user-av">شما</div>`
    : `<div class="avatar ai">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
       </div>`;

  row.innerHTML = `
    ${avatarHTML}
    <div>
      <div class="bubble ${role === 'user' ? 'user-bubble' : 'ai-bubble'}">${formatText(text)}</div>
      <div class="msg-time">${getTime()}</div>
    </div>`;

  messagesEl.appendChild(row);
  scrollBottom();
}

function showTyping() {
  removeWelcome();
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.id = 'typing-row';
  row.innerHTML = `
    <div class="avatar ai">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  messagesEl.appendChild(row);
  scrollBottom();
}

function removeTyping() {
  const el = document.getElementById('typing-row');
  if (el) el.remove();
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 3500);
}

function scrollBottom() {
  requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
}

function autoResize() {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
}

function getTime() {
  return new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function formatText(text) {
  text = escHtml(text);
  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\n/g, '<br>');
  return text;
}

function useSuggestion(btn) {
  inputEl.value = btn.textContent.trim();
  autoResize();
  charCountEl.textContent = inputEl.value.length + ' / 4000';
  sendMessage();
}

function clearChat() { resetToWelcome(); }

// ─── Event bindings ───────────────────────────────────────────────────────────
function bindEvents() {
  menuBtn.addEventListener('click', openSidebar);
  sbClose.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  sbNewChat.addEventListener('click',  () => { resetToWelcome(); closeSidebar(); });
  newChatBtn.addEventListener('click', resetToWelcome);
  clearBtn.addEventListener('click',   clearChat);
  sbClearAll.addEventListener('click', clearAllConversations);

  inputEl.addEventListener('input', () => {
    autoResize();
    charCountEl.textContent = inputEl.value.length + ' / 4000';
    sendBtnEl.disabled = !inputEl.value.trim() || isLoading;
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtnEl.addEventListener('click', sendMessage);
  sendBtnEl.disabled = true;

  // Clear localStorage on logout
  const logoutForm = document.querySelector('[action*="logout"]');
  if (logoutForm) {
    logoutForm.addEventListener('submit', () => {
      localStorage.removeItem('aria_conversations');
    });
  }
}