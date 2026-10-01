// Main JS for SMS Route BD Admin Panel

document.addEventListener('DOMContentLoaded', () => {
  initMobileSidebar();
  initCharacterCounters();
  initCopyButtons();
});

// Mobile Sidebar Drawer
function initMobileSidebar() {
  const openBtn = document.getElementById('open-sidebar-btn');
  const closeBtn = document.getElementById('close-sidebar-btn');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  function openSidebar() {
    if (!sidebar || !backdrop) return;
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
    setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
    document.body.classList.add('overflow-hidden');
  }

  function closeSidebar() {
    if (!sidebar || !backdrop) return;
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }, 200);
  }

  if (openBtn) openBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && !sidebar.classList.contains('-translate-x-full')) {
      closeSidebar();
    }
  });
}

// Character and SMS Count Calculator
function initCharacterCounters() {
  const messageInputs = document.querySelectorAll('[data-char-counter]');
  messageInputs.forEach(input => {
    const counterDisplay = document.querySelector(input.dataset.charCounter);
    if (!counterDisplay) return;

    function update() {
      const text = input.value;
      const len = text.length;
      
      // Check if text contains non-ASCII (e.g. Bangla / Unicode)
      const isUnicode = /[^\u0000-\u007F]/.test(text);
      const maxLimit = 1224;
      
      let smsParts = 0;
      if (len > 0) {
        if (!isUnicode) {
          smsParts = len <= 160 ? 1 : Math.ceil(len / 153);
        } else {
          smsParts = len <= 70 ? 1 : Math.ceil(len / 67);
        }
      }

      // Check number of recipients if recipient field exists
      let recipientCount = 1;
      const recipientInput = document.querySelector('[data-recipient-counter]');
      if (recipientInput && recipientInput.value.trim()) {
        const numbers = recipientInput.value.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
        recipientCount = Math.max(1, numbers.length);
      }

      const totalSmsNeeded = smsParts * recipientCount;

      counterDisplay.textContent = `${len} / ${maxLimit} chars · ${totalSmsNeeded} SMS used${isUnicode && len > 0 ? ' (Bangla)' : ''}`;
    }

    input.addEventListener('input', update);
    const recipientInput = document.querySelector('[data-recipient-counter]');
    if (recipientInput) recipientInput.addEventListener('input', update);
    update();
  });
}

// Copy to clipboard helper
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('[data-copy-target]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.dataset.copyTarget;
      const target = document.querySelector(targetSelector);
      if (!target) return;
      
      const textToCopy = target.value || target.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Failed to copy', 'error');
      });
    });
  });
}

// Toast notification helper
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white';
  const icon = type === 'success' 
    ? `<svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
    : `<svg class="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;

  toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-slide-up ${bg} transition-all duration-300 max-w-md`;
  toast.innerHTML = `${icon}<span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// =========================================================================
// ANTI-ABUSE & THREAT CONTENT DETECTION ENGINE (BTRC POLICY COMPLIANCE)
// =========================================================================

const PROHIBITED_WORDS = [
  // English Profanity & Slurs
  { word: 'fuck', category: 'গালাগালি (Abusive)' },
  { word: 'bitch', category: 'গালাগালি (Abusive)' },
  { word: 'bastard', category: 'গালাগালি (Abusive)' },
  { word: 'asshole', category: 'গালাগালি (Abusive)' },
  { word: 'motherfucker', category: 'গালাগালি (Abusive)' },
  { word: 'dick', category: 'গালাগালি (Abusive)' },
  { word: 'pussy', category: 'গালাগালি (Abusive)' },
  { word: 'cunt', category: 'গালাগালি (Abusive)' },
  { word: 'slut', category: 'গালাগালি (Abusive)' },
  { word: 'whore', category: 'গালাগালি (Abusive)' },

  // English Threats & Violence
  { word: 'kill you', category: 'হুমকি (Threat / Violence)' },
  { word: 'kill u', category: 'হুমকি (Threat / Violence)' },
  { word: 'murder', category: 'হুমকি (Threat / Violence)' },
  { word: 'threat', category: 'হুমকি (Threat / Violence)' },
  { word: 'threaten', category: 'হুমকি (Threat / Violence)' },
  { word: 'bomb', category: 'হুমকি (Threat / Violence)' },
  { word: 'blast', category: 'হুমকি (Threat / Violence)' },
  { word: 'shoot you', category: 'হুমকি (Threat / Violence)' },
  { word: 'stab you', category: 'হুমকি (Threat / Violence)' },
  { word: 'kidnap', category: 'হুমকি (Threat / Violence)' },
  { word: 'destroy your life', category: 'হুমকি (Threat / Violence)' },
  { word: 'extortion', category: 'হুমকি (Threat / Violence)' },
  { word: 'ransom', category: 'হুমকি (Threat / Violence)' },
  { word: 'i will kill', category: 'হুমকি (Threat / Violence)' },

  // Bangla Abusive / Galagali (গালাগালি)
  { word: 'মাগি', category: 'গালাগালি (Abusive)' },
  { word: 'হারামি', category: 'গালাগালি (Abusive)' },
  { word: 'হারামজাদা', category: 'গালাগালি (Abusive)' },
  { word: 'খানকির ছেলে', category: 'গালাগালি (Abusive)' },
  { word: 'খানকির পোলা', category: 'গালাগালি (Abusive)' },
  { word: 'কুত্তার বাচ্চা', category: 'গালাগালি (Abusive)' },
  { word: 'শুয়োরের বাচ্চা', category: 'গালাগালি (Abusive)' },
  { word: 'শুওরের বাচ্চা', category: 'গালাগালি (Abusive)' },
  { word: 'বেশ্যা', category: 'গালাগালি (Abusive)' },
  { word: 'চুতিয়া', category: 'গালাগালি (Abusive)' },
  { word: 'মাদারচোদ', category: 'গালাগালি (Abusive)' },
  { word: 'ভোদা', category: 'গালাগালি (Abusive)' },
  { word: 'বাল', category: 'গালাগালি (Abusive)' },

  // Bangla Threats / Humki (হুমকি ও সহিংসতা)
  { word: 'মেরে ফেলব', category: 'হুমকি (Threat / Violence)' },
  { word: 'মেরে ফেলবো', category: 'হুমকি (Threat / Violence)' },
  { word: 'খুন করব', category: 'হুমকি (Threat / Violence)' },
  { word: 'খুন করবো', category: 'হুমকি (Threat / Violence)' },
  { word: 'হত্যা করব', category: 'হুমকি (Threat / Violence)' },
  { word: 'হত্যা করবো', category: 'হুমকি (Threat / Violence)' },
  { word: 'উড়িয়ে দেব', category: 'হুমকি (Threat / Violence)' },
  { word: 'উড়িয়ে দেব', category: 'হুমকি (Threat / Violence)' },
  { word: 'বোমা মারব', category: 'হুমকি (Threat / Violence)' },
  { word: 'বোমা মারবো', category: 'হুমকি (Threat / Violence)' },
  { word: 'জীবন শেষ করে দেব', category: 'হুমকি (Threat / Violence)' },
  { word: 'তুলে নিয়ে যাব', category: 'হুমকি (Threat / Violence)' },
  { word: 'তুলে নিয়ে যাব', category: 'হুমকি (Threat / Violence)' },
  { word: 'অপহরণ করব', category: 'হুমকি (Threat / Violence)' },
  { word: 'টাকা না দিলে মেরে', category: 'হুমকি (Threat / Violence)' },
  { word: 'চাঁদাবাজি', category: 'হুমকি (Threat / Violence)' },
  { word: 'চাদাবাজি', category: 'হুমকি (Threat / Violence)' },
  { word: 'হুমকি দিলাম', category: 'হুমকি (Threat / Violence)' },

  // Banglish / Romanized (রোমানাইজড বাংলা গালাগালি ও হুমকি)
  { word: 'mere felbo', category: 'হুমকি (Threat / Violence)' },
  { word: 'mere felte', category: 'হুমকি (Threat / Violence)' },
  { word: 'khun korbo', category: 'হুমকি (Threat / Violence)' },
  { word: 'boma marbo', category: 'হুমকি (Threat / Violence)' },
  { word: 'jibon shesh', category: 'হুমকি (Threat / Violence)' },
  { word: 'tule niye jabo', category: 'হুমকি (Threat / Violence)' },
  { word: 'humki dilam', category: 'হুমকি (Threat / Violence)' },
  { word: 'khankir pola', category: 'গালাগালি (Abusive)' },
  { word: 'khankir chele', category: 'গালাগালি (Abusive)' },
  { word: 'kuttar bachha', category: 'গালাগালি (Abusive)' },
  { word: 'kuttar bacha', category: 'গালাগালি (Abusive)' },
  { word: 'shuorer bachha', category: 'গালাগালি (Abusive)' },
  { word: 'harami', category: 'গালাগালি (Abusive)' },
  { word: 'haramzada', category: 'গালাগালি (Abusive)' },
  { word: 'magi', category: 'গালাগালি (Abusive)' },
  { word: 'chutiya', category: 'গালাগালি (Abusive)' },
  { word: 'madarchod', category: 'গালাগালি (Abusive)' }
];

// Check if message contains forbidden keywords
function checkProhibitedContent(text) {
  if (!text) return null;
  const lowerText = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?'"+\n\r]/g, ' ');

  for (const item of PROHIBITED_WORDS) {
    const itemWord = item.word.toLowerCase();
    if (lowerText.includes(itemWord) || text.includes(item.word)) {
      return item;
    }
  }
  return null;
}

// Display warning modal
function showWarningModal(detectedWord, category) {
  let modal = document.getElementById('abuse-warning-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'abuse-warning-modal';
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-up';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 animate-shake">
      <div class="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <div class="text-center space-y-2">
        <h3 class="text-lg font-bold text-slate-900">⚠️ আপত্তিকর বার্তা সনাক্ত হয়েছে!</h3>
        <p class="text-xs text-rose-600 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
          শনাক্তকৃত শব্দ: <strong class="underline font-bold">"${detectedWord}"</strong> (${category})
        </p>
        <p class="text-xs text-slate-600 leading-relaxed pt-1">
          বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (BTRC) নীতিমালা অনুযায়ী এসএমএস-এ কাউকে <strong>হুমকি দেওয়া</strong>, <strong>চাঁদাবাজি</strong> বা <strong>গালাগালি</strong> করা আইনত দণ্ডনীয় অপরাধ।
        </p>
        <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-center gap-2">
          <svg class="w-4 h-4 animate-spin text-amber-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>বার্তাটি পাঠানো হয়নি! ২ সেকেন্ডের মধ্যে টেক্সট মুছে যাচ্ছে...</span>
        </div>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');

  setTimeout(() => {
    modal.classList.add('hidden');
  }, 2200);
}

// Process abusive text: block send, highlight red, and auto-delete after 2 seconds
function handleAbuseViolation(inputElement, detectedItem) {
  // 1. Highlight input in red and shake
  inputElement.classList.add('animate-shake', '!border-rose-500', '!bg-rose-50', '!text-rose-900', 'ring-2', 'ring-rose-400');
  inputElement.disabled = true;

  // 2. Show Warning Modal & Toast
  showWarningModal(detectedItem.word, detectedItem.category);
  showToast(`⚠️ এসএমএস পাঠানো বাতিল: আপত্তিকর শব্দ "${detectedItem.word}" সনাক্ত হয়েছে!`, 'error');

  // 3. Exactly after 2 seconds (2 sec por), clear text
  setTimeout(() => {
    inputElement.value = '';
    inputElement.disabled = false;
    inputElement.classList.remove('animate-shake', '!border-rose-500', '!bg-rose-50', '!text-rose-900', 'ring-2', 'ring-rose-400');
    
    // Dispatch input to reset counters and preview
    inputElement.dispatchEvent(new Event('input'));
    inputElement.focus();

    showToast('🚫 আপত্তিকর বার্তাটি স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়েছে।', 'error');
  }, 2000);

  return false;
}

// Quick Send form handler with Anti-Abuse Filter
function handleQuickSend(event) {
  event.preventDefault();
  const phone = document.getElementById('quick-recipient')?.value.trim();
  const msgInput = document.getElementById('quick-message');
  const message = msgInput?.value.trim();

  if (!phone) {
    showToast('Please enter a recipient phone number', 'error');
    return;
  }
  if (!message) {
    showToast('Please enter your SMS message', 'error');
    return;
  }

  // Check prohibited content
  const violation = checkProhibitedContent(message);
  if (violation) {
    handleAbuseViolation(msgInput, violation);
    return; // SMS will NOT be sent
  }

  showToast(`SMS sent successfully to ${phone}! (1 SMS deducted)`, 'success');
  event.target.reset();
  const counter = document.getElementById('quick-char-count');
  if (counter) counter.textContent = '0 / 1224 chars · 0 SMS used';
}
