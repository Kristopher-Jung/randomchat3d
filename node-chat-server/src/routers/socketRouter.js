const formatMessage = require('../models/messages');
const http = require('http');
require('dotenv').config();
const node_env = process.env.NODE_ENV || 'development';
let APP_URL = null;
if(node_env === 'development') {
  APP_URL = process.env.LOCAL_URL;
} else {
  APP_URL = process.env.PRODUCTION_URL;
}
console.log(`Socket Router connected to env: ${node_env}`);

const MONGO_PORT = process.env.MONGO_PORT;
const SERVER = 'ServerMessage';

// socket.broadcast.emit send message to all clients connected, except current user
// io.emit send message to all clients
// socket.emit send message to the client
const router = function(socket, io, clientUsername) {
  // Welcome current user
  console.log(`socket connection with username: ${clientUsername}, socketId: ${socket.id}`);
  socket.emit(SERVER, `Welcome to Chat Server! ${clientUsername}, socketId:${socket.id}`);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    // Broadcast when a user connects to the room
    socket.broadcast
      .to(roomId)
      .emit(SERVER, formatMessage(clientUsername, roomId,`${clientUsername} has joined the chat room: ${roomId}`));
  });

  //when user left room, but did not signOut yet.
  socket.on('leaveRoom', (roomId) => {
    console.log(`${clientUsername} is leaving roomId:${roomId}`)
    socket.leave(roomId);
    // Broadcast when a user disconnect from the room
    socket.broadcast
      .to(roomId)
      .emit(SERVER, formatMessage(clientUsername, roomId, `${clientUsername} has left the chat room: ${roomId}`));
  });

  // Listen for textChatMessage
  socket.on('textChat', ({textMessage, username, roomId}) => {
    io.to(roomId).emit('textChat', {textMessage, username, roomId});
  })

  // Runs when client disconnects completely (signOut)
  socket.on('disconnect', () => {
    console.log(`socket disconnection with username: ${clientUsername}, socketId: ${socket.id}`);
    http.get(`${APP_URL}:${MONGO_PORT}/user/leaveChat/${clientUsername}`, resp => {
      console.log(`${clientUsername} leave room, Mongo roomId = null`);
    }).on("error", err => {
      console.log("Error: " + err.message);
    });
  });
};

module.exports = router;
