const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });
wss.on('connection', ws => {
  ws.on('message', msg => {
    // broadcast to others
    wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(msg));
  });
});
console.log('ws listening ws://localhost:3001');