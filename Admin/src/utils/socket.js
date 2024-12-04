// src/socket.js

import {io} from 'socket.io-client';

// Replace with your server URL (e.g., localhost:8091:3000 or the deployed server URL)
const socket = io('http://localhost:8091:8080', {
  // Optional config
  transports: ['websocket']
});

export default socket;
