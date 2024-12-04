// src/socket.js

import {io} from 'socket.io-client';

// Replace with your server URL (e.g., localhost:8091 or the deployed server URL)
const socket = io('http://localhost:8091', {
  // Optional config
  transports: ['websocket']
});

export default socket;
