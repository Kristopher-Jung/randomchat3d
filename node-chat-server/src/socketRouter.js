const formatMessage = require('./models/messages');

// socket.broadcast.emit send message to all clients connected, except current user
// io.emit send message to all clients
// socket.emit send message to the client
const router = function(socket, io, token) {
  // Welcome current user
  socket.emit('message',
    formatMessage(token, 'Welcome to chat!'));

  // Broadcast when a user connects
  socket.broadcast.emit('message',
    formatMessage(token, 'A user has joined the chat'));

  // Runs when client disconnects
  socket.on('disconnect', () => {
    console.log(`socket disconnection with username: ${token}`);
    io.emit('message',
      formatMessage(token, 'A user has left the chat'));
  });

  // Listen for textChatMessage
  socket.on('textChatMessage', textMessage => {
    io.emit('message',
      formatMessage(token, textMessage))
  })
};

module.exports = router;
