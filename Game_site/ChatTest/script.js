// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('textbox-form');
  const textInput = document.getElementById('textbox-input');
  const outputDiv = document.getElementById('outputDiv');
  const displayInput = document.getElementById('displayname-input');

  if (!form || !textInput || !outputDiv) {
    console.warn('Missing required elements: textbox-form, textbox-input or outputDiv');
    return;
  }

  const MESSAGES_KEY = 'sharedMessages';

  function getMessages() {
    try {
      return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    } catch (err) {
      console.error('Failed to parse messages from localStorage', err);
      return [];
    }
  }

  function saveMessages(messages) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }

  function formatTimestamp(ms) {
    try {
      const d = new Date(ms);
      return d.toLocaleString(); // change formatting if you want a different layout
    } catch (err) {
      return '';
    }
  }

  function renderMessages() {
    // Clear existing messages
    outputDiv.innerHTML = '';

    const messages = getMessages();
    messages.forEach(m => {
      const p = document.createElement('p');
      p.style.margin = '0';
      p.style.padding = '4px 0';

      // Create timestamp element
      const timeEl = document.createElement('span');
      timeEl.textContent = `[${formatTimestamp(m.time)}] `;
      timeEl.style.color = '#666';
      timeEl.style.fontSize = '0.9em';
      timeEl.style.marginRight = '6px';

      // Create name element
      const nameEl = document.createElement('strong');
      nameEl.textContent = `${m.name}${m.name ? ': ' : ''}`;
      nameEl.style.marginRight = '6px';

      // Create message text
      const textEl = document.createElement('span');
      textEl.textContent = m.text;

      p.appendChild(timeEl);
      p.appendChild(nameEl);
      p.appendChild(textEl);

      outputDiv.appendChild(p);
    });

    // Scroll to bottom so newest messages are visible
    outputDiv.scrollTop = outputDiv.scrollHeight;
  }

  // Initial render on page load
  renderMessages();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (displayInput && displayInput.value && displayInput.value.trim()) ? displayInput.value.trim() : 'Anonymous';
    const msg = (textInput.value || '').trim();
    if (!msg) return;

    const newMsg = {
      name,
      text: msg,
      time: Date.now()
    };

    const messages = getMessages();
    messages.push(newMsg);

    // Optionally: limit messages length to prevent unbounded growth
    const MAX_MESSAGES = 500;
    if (messages.length > MAX_MESSAGES) messages.splice(0, messages.length - MAX_MESSAGES);

    saveMessages(messages);

    // Update this tab's DOM immediately (storage event won't fire in the same tab)
    renderMessages();

    textInput.value = '';
    textInput.focus();
  });

  // Listen for storage changes in other tabs/windows
  window.addEventListener('storage', (e) => {
    if (e.key === MESSAGES_KEY) {
      renderMessages();
    }
  });
});


