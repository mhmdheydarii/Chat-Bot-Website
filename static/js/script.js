// CHAT_URL و CSRF_TOKEN از template میان — بالای این فایل توی HTML تعریف شدن

let conversationHistory = [];
let isLoading = false;

const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const charCountEl = document.getElementById('char-count');
const toastEl = document.getElementById('toast');

// ── Event listeners ──────────────────────────────────

// Auto resize textarea وقتی کاربر تایپ می‌کنه
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
  charCountEl.textContent = inputEl.value.length + ' / 4000';
});

// Enter برای ارسال، Shift+Enter برای خط جدید
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ── Helper functions ──────────────────────────────────

function getTime() {
  return new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

// تبدیل markdown ساده به HTML
function formatText(text) {
  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\n/g, '<br>');
  return text;
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 3500);
}

// ── UI functions ──────────────────────────────────────

function addMessage(role, text) {
  // اگه welcome screen هست حذفش کن
  const welcomeEl = document.getElementById('welcome');
  if (welcomeEl) welcomeEl.remove();

  const row = document.createElement('div');
  row.className = `msg-row ${role === 'user' ? 'user' : ''}`;

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
    </div>
  `;

  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping() {
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.id = 'typing-row';
  row.innerHTML = `
    <div class="avatar ai">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-row');
  if (el) el.remove();
}

// ── Core functions ────────────────────────────────────

// وقتی روی suggestion کلیک می‌کنه
function useSuggestion(btn) {
  inputEl.value = btn.textContent;
  inputEl.dispatchEvent(new Event('input'));
  sendMessage();
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || isLoading) return;

  // reset input
  isLoading = true;
  sendBtn.disabled = true;
  inputEl.value = '';
  inputEl.style.height = 'auto';
  charCountEl.textContent = '0 / 4000';

  // پیام کاربر رو به تاریخچه اضافه کن و نشون بده
  conversationHistory.push({ role: 'user', content: text });
  addMessage('user', text);
  showTyping();

  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': CSRF_TOKEN,   // Django CSRF protection
      },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `خطای سرور: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.reply;

    // جواب AI رو به تاریخچه اضافه کن و نشون بده
    conversationHistory.push({ role: 'assistant', content: reply });
    removeTyping();
    addMessage('assistant', reply);

  } catch (err) {
    removeTyping();
    showToast('⚠️ ' + err.message);
    // اگه خطا داشت پیام کاربر رو از تاریخچه حذف کن
    conversationHistory.pop();
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

function clearChat() {
  conversationHistory = [];
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
    </div>
  `;
}