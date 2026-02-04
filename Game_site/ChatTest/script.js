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

  function renderMessages() {
    outputDiv.innerHTML = '';
    const messages = getMessages();
    messages.forEach(msg => {
      const p = document.createElement('p');
      p.textContent = msg;
      p.style.margin = '0';
      p.style.padding = '2px 0';
      outputDiv.appendChild(p);
    });
    // scroll to bottom if desired:
    outputDiv.scrollTop = outputDiv.scrollHeight;
  }

  // Initial render on page load
  renderMessages();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (displayInput && displayInput.value && displayInput.value.trim()) ? displayInput.value.trim() : 'Anonymous';
    const msg = (textInput.value || '').trim();
    if (!msg) return;

    const newText = `${name}: ${msg}`;
    const messages = getMessages();
    messages.push(newText);
    saveMessages(messages);

    // Update this tab's DOM immediately (storage event won't fire in same tab)
    renderMessages();

    textInput.value = '';
    textInput.focus();
  });

  // Listen for changes to localStorage in other tabs/windows
  window.addEventListener('storage', (e) => {
    if (e.key === MESSAGES_KEY) {
      renderMessages();
    }
  });
});
