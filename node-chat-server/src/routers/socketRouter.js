const {formatMessage, ControllerEnum} = require('../models/messages');
const http = require('http');
const https = require('https');
require('dotenv').config();
const node_env = process.env.NODE_ENV || 'development';
let APP_URL = null;
const PORT = process.env.PORT || 3000;
if (node_env === 'development') {
  APP_URL = `${process.env.LOCAL_URL}:${PORT}`;
} else {
  APP_URL = process.env.PRODUCTION_URL;
}
console.log(`Socket Router connected to env: ${node_env} using AppUrl: ${APP_URL} PORT: ${PORT}`);

const SERVER = 'ServerMessage';
let connectCount = 0;

// socket.broadcast.emit send message to all clients connected, except current user
// io.emit send message to all clients
// socket.emit send message to the client
const router = function (socket, io, clientUsername) {
  // Welcome current user
  connectCount+=1;
  console.log(`socket connection with username: ${clientUsername}, socketId: ${socket.id}`);
  socket.emit(SERVER, formatMessage(clientUsername, null,
    `Welcome to Chat Server! ${clientUsername}`,
    ControllerEnum.DISPLAY));
  io.emit(SERVER, formatMessage(null, null, connectCount, ControllerEnum.SOCKET_STAT));

  socket.on('joinRoom', ({roomId, character}) => {
    socket.join(roomId);
    // Broadcast when a user connects to the room
    const numberConnections = io.sockets.adapter.rooms.get(roomId).size;
    if (numberConnections === 1) {
      io.to(roomId).emit(SERVER, formatMessage(clientUsername,
        // Tell UI to wait until someone join the chat room.
        roomId, numberConnections, ControllerEnum.AWAIT));
    } else {
      io.to(roomId).emit(SERVER, formatMessage(clientUsername,
        // Tell UI to stop waiting for the new user for the chat room.
        roomId, numberConnections, ControllerEnum.COMPLETE));
    }
    socket.broadcast
      .to(roomId)
      .emit(SERVER, formatMessage(clientUsername,
        roomId, `${clientUsername} has joined the chat room: ${JSON.stringify(roomId)}`, ControllerEnum.DISPLAY));

    socket.broadcast
      .to(roomId)
      .emit(SERVER, formatMessage(clientUsername,
        roomId, character, ControllerEnum.AVATAR_CONTROL));
  });

  socket.on('completeJoinRoom', ({roomId, character}) => {
    socket.broadcast
      .to(roomId)
      .emit(SERVER, formatMessage(clientUsername,
        roomId, character, ControllerEnum.AVATAR_CONTROL));
  });

  //when user left room, but did not signOut yet.
  socket.on('leaveRoom', (roomId) => {
    console.log(`${clientUsername} is leaving roomId:${roomId}`)
    let numberConnections = io.sockets.adapter.rooms.get(roomId).size;
    socket.leave(roomId);
    // Broadcast when a user disconnect from the room
    socket.broadcast
      .to(roomId)
      .emit(SERVER, formatMessage(clientUsername,
        roomId, `${clientUsername} has left the chat room: ${roomId}`, ControllerEnum.DISPLAY));
    numberConnections -= 1;
    // Tell UI to wait until someone join the chat room.
    socket.broadcast
      .to(roomId)
      .emit(SERVER, formatMessage(clientUsername,
        roomId, numberConnections, ControllerEnum.AWAIT));
    if (node_env === 'development') {
      http.get(`${APP_URL}/user/leaveRoom/${clientUsername}`, resp => {
        console.log(`${clientUsername} leave room, Mongo roomId = null`);
      }).on("error", err => {
        console.log("Error: " + err.message);
      });
    } else {
      https.get(`${APP_URL}/user/leaveRoom/${clientUsername}`, resp => {
        console.log(`${clientUsername} leave room, Mongo roomId = null`);
      }).on("error", err => {
        console.log("Error: " + err.message);
      });
    }
  });

  // Listen for textChatMessage
  socket.on('textChat', ({textMessage, username, roomId}) => {
    const time = new Date().getTime();
    io.to(roomId).emit('textChat', {textMessage, username, roomId, time});
  })

  socket.on('move', ({keyInput, username, roomId}) => {
    socket.broadcast
      .to(roomId)
      .emit('move', {keyInput, username, roomId});
  });

  // Runs when client disconnects completely (signOut) or close browser/ dced unexpectedly
  socket.on('disconnect', () => {
    console.log(`socket disconnection with username: ${clientUsername}, socketId: ${socket.id}`);
    if (node_env === 'development') {
      http.get(`${APP_URL}/user/signOut/${clientUsername}`, resp => {
        console.log(`${clientUsername} leave room, Mongo roomId = null`);
      }).on("error", err => {
        console.log("Error: " + err.message);
      });
    } else {
      https.get(`${APP_URL}/user/signOut/${clientUsername}`, resp => {
        console.log(`${clientUsername} leave room, Mongo roomId = null`);
      }).on("error", err => {
        console.log("Error: " + err.message);
      });
    }
    connectCount-=1;
    io.emit(SERVER, formatMessage(null, null, connectCount, ControllerEnum.SOCKET_STAT));
  });
};

module.exports = router;
