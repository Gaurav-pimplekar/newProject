// src/socket.js

import {io} from 'socket.io-client';

// Replace with your server URL (e.g., 192.168.1.11:3000 or the deployed server URL)
const socket = io('http://192.168.1.11:8080', {
  // Optional config
  transports: ['websocket']
});

export default socket;
