const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from "public"
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  // optional: set a username for this socket
  socket.on('set username', (username) => {
    socket.data.username = username || 'Anonymous';
  });

  socket.on('chat message', (message) => {
    const payload = {
      username: socket.data.username || 'Anonymous',
      message: message,
      time: new Date().toISOString()
    };
    // Broadcast to all connected clients
    io.emit('chat message', payload);
  });

  socket.on('disconnect', () => {
    console.log('disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));