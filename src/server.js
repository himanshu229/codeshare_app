const { createServer } = require('http');
const path = require('path');
const { Server } = require('socket.io');
const fs = require('fs');
const os = require('os');

// Set up port and environment
const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3001;

function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (let interfaceName in networkInterfaces) {
    for (let i = 0; i < networkInterfaces[interfaceName].length; i++) {
      const iface = networkInterfaces[interfaceName][i];
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Create the HTTP server
const server = createServer((req, res) => {

  // Serving static files (build folder in production)
  const filePath = path.join(__dirname, "../client/build", req.url === '/' ? 'index.html' : req.url);
  const extname = path.extname(filePath);
  let contentType = 'text/html';

  if (extname === '.js') contentType = 'application/javascript';
  if (extname === '.css') contentType = 'text/css';
  if (extname === '.json') contentType = 'application/json';
  if (extname === '.png') contentType = 'image/png';
  if (extname === '.jpg') contentType = 'image/jpg';
  if (extname === '.jpeg') contentType = 'image/jpeg';
  if (extname === '.gif') contentType = 'image/gif';

  // Read the file and send it to the client
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", 
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Store data for clients
let dataStore = "";

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A client connected');

  // Send stored data to any new client
  if (dataStore.length > 0) {
    io.emit('/send-message', dataStore);
  }

  // Listen for incoming chat messages
  socket.on('/send-message', (msg) => {
    dataStore = msg;
    io.emit('/send-message', msg);
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

const serverIP = getLocalIP();
server.listen(port, serverIP, () => {
  console.log(`Server running on ${serverIP}:${port}`);
});
