const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import CORS middleware

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3001;

let dataStore = "";

// Create HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running');
});

// Set up CORS options for Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", 
    allowedHeaders: ["my-custom-header"], 
    credentials: true 
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A client connected');

  // Send stored data to any new client
  if (dataStore.length > 0) {
    io.emit('chat message', dataStore);
  }

  // Listen for incoming chat messages
  socket.on('chat message', (msg) => {
    dataStore = msg;
    io.emit('chat message', msg);
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Start server
server.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
