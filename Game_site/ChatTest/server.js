// server.js
const express = require('express');
const app = express();
app.use(express.json());
app.post('/messages', (req, res) => {
  console.log('received', req.body);
  res.json({ ok: true });
});
app.listen(3000, () => console.log('listening on http://localhost:3000'));