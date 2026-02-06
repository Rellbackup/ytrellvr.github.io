const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let messages = []; // In-memory storage

app.get('/', (req, res) => {
  res.json(messages);
});

app.post('/', (req, res) => {
  const msg = req.body;
  if (!msg || !msg.text) {
    return res.status(400).json({ error: 'Invalid message' });
  }
  messages.push(msg);
  res.status(201).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
