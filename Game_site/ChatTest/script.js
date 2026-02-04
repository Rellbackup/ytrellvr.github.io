document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('textbox-form');
  const textInput = document.getElementById('textbox-input');
  const outputDiv = document.getElementById('outputDiv');
  const displayInput = document.getElementById('displayname-input');

  const API_URL = 'https://ytrellvr-github-io-0x4g.onrender.com';

  async function fetchMessages() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function postMessage(message) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      if (!res.ok) throw new Error('Failed to post message');
    } catch (err) {
      console.error(err);
    }
  }

  function formatTimestamp(ms) {
    try {
      const d = new Date(ms);
      return d.toLocaleString();
    } catch {
      return '';
    }
  }

  async function renderMessages() {
    outputDiv.innerHTML = '';

    const messages = await fetchMessages();

    messages.forEach(m => {
      const p = document.createElement('p');
      p.style.margin = '0';
      p.style.padding = '4px 0';

      const timeEl = document.createElement('span');
      timeEl.textContent = `[${formatTimestamp(m.time)}] `;
      timeEl.style.color = '#666';
      timeEl.style.fontSize = '0.9em';
      timeEl.style.marginRight = '6px';

      const nameEl = document.createElement('strong');
      nameEl.textContent = `${m.name}${m.name ? ': ' : ''}`;
      nameEl.style.marginRight = '6px';

      const textEl = document.createElement('span');
      textEl.textContent = m.text;

      p.appendChild(timeEl);
      p.appendChild(nameEl);
      p.appendChild(textEl);

      outputDiv.appendChild(p);
    });

    outputDiv.scrollTop = outputDiv.scrollHeight;
  }

  // Initial load
  renderMessages();

  // Optional: poll every 1 seconds for updates
  setInterval(renderMessages, 1000);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = (displayInput?.value?.trim()) || 'Anonymous';
    const msg = (textInput.value || '').trim();
    if (!msg) return;

    const newMsg = {
      name,
      text: msg,
      time: Date.now()
    };

    await postMessage(newMsg);
    await renderMessages();

    textInput.value = '';
    textInput.focus();
  });
});
