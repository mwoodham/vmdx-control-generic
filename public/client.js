// public/client.js

const socket = io();
let clientId = null;

// Initialize the client with a unique ID
socket.on('init', (data) => {
  clientId = data.clientId;
  console.log(`Connected with Client ID: ${clientId}`);
});

// Function to send parameter changes
function sendParameterChange(parameter, value) {
  socket.emit('parameterChange', {
    parameter,
    value
  });
}

// Add event listeners to all range inputs
document.querySelectorAll('input[type=range]').forEach((slider) => {
  slider.addEventListener('input', (event) => {
    const parameter = event.target.name;
    const value = parseFloat(event.target.value) / 100; // Normalize to 0-1 if needed
    sendParameterChange(parameter, value);
  });
});