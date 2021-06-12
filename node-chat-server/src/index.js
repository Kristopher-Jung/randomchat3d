const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const formatMessage = require('./messages');

const server = http.createServer(express);
const io = socketio(server, {
  cors: {
    origins: ['http://localhost:4200']
  }
});

app.use(express.static(path.join(__dirname, 'static')))

app.get('/', (req, res) => {
  res.send('<h1>Server is running</h1>');
});

// socket.broadcast.emit send message to all clients connected, except current user
// io.emit send message to all clients
// socket.emit send message to the client
io.on("connection", socket => {
  // user's token
  const token = socket.handshake.auth.token;
  console.log(token);

  // Welcome current user
  socket.emit('message',
    formatMessage(token, 'Welcome to chat!'));

  // Broadcast when a user connects
  socket.broadcast.emit('message',
    formatMessage(token, 'A user has joined the chat'));

  // Runs when client disconnects
  socket.on('disconnect', socket => {
    io.emit('message',
      formatMessage(token, 'A user has left the chat'));
  });

  // Listen for textChatMessage
  socket.on('textChatMessage', textMessage => {
    io.emit('message',
      formatMessage(token, textMessage))
  })
});

// Initialize our websocket server on port 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`started chat-server on port: ${PORT}`);
});
