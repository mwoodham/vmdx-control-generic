// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const osc = require('osc');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// OSC UDP Port Setup
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 0, // Let the system pick an available port
  remoteAddress: "10.0.1.65", // VDMX OSC Query Server IP
  remotePort: 2345,            // VDMX OSC Query Server Port
  metadata: true
});

// Open the OSC port
udpPort.open();

// Handle OSC errors
udpPort.on("error", function (error) {
  console.error("OSC Error: ", error);
});

// Manage client connections
io.on('connection', (socket) => {
  const clientId = uuidv4();
  socket.emit('init', { clientId });

  console.log(`Client connected: ${clientId}`);

  // Handle parameter changes from clients
  socket.on('parameterChange', (data) => {
    const { parameter, value } = data;

    // Structure the OSC message
    const oscMessage = {
      address: `/${parameter}`,
      args: [
        {
          type: "f", // Assuming float; adjust as needed
          value: value
        }
      ]
    };

    // Send the OSC message
    udpPort.send(oscMessage);
    console.log(`Sent OSC message: ${oscMessage.address} = ${value}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${clientId}`);
    // Optionally, handle cleanup if necessary
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});