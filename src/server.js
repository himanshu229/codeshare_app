const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const robot = require('robotjs');
const os = require('os');
const cors = require('cors');

const port = process.env.PORT || 3001;

function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (let interfaceName in networkInterfaces) {
    for (let iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const serverIP = getLocalIP();

const options = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.cert')
};

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const httpsServer = https.createServer(options, app);

const io = new Server(httpsServer, {
  cors: {
    origin: "*",
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('screen-data', (data) => {
    socket.broadcast.emit('screen-data', data);
  });

  socket.on('mouse-event', (data) => {
    const { type, x, y, deltaY } = data;
    console.log("Mouse", data)
    switch (type) {
      case 'mousedown':
        robot.mouseToggle('down');
        break;
      case 'mouseup':
        robot.mouseToggle('up');
        break;
      case 'mousemove':
        robot.moveMouse(x, y);
        break;
      case 'click':
        robot.mouseClick();
        break;
      case 'rightclick':
        robot.mouseClick('right');
        break;
      case 'scroll':
        robot.scrollMouse(0, deltaY);
        break;
      default:
        console.warn(`Unhandled mouse event type: ${type}`);
    }
  });
  
  socket.on('keyboard-event', (data) => {
    const { type, key } = data;
    try {
      console.log("Key", data)
      robot.keyToggle(key, type);
    } catch (error) {
      console.error(`Error simulating key event: ${error.message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

httpsServer.listen(port, serverIP, () => {
  console.log(`✅ HTTPS Server running at:`);
  console.log(`🔹 https://localhost:${port}`);
  console.log(`🔹 https://${serverIP}:${port}`);
});