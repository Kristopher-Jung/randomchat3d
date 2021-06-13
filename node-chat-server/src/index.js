require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const formatMessage = require('./messages');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

/**
 * MongoDB server
 */
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
const MONGO_PORT = process.env.MONGO_PORT || 5000;
app.listen(MONGO_PORT, () => {
  console.log(`started mongo-server on port: ${MONGO_PORT}`);
});

//Mongo DB Connection
mongoose.promise = global.Promise;
const mongoUrl = process.env.CONNECTION_STRING;
console.log(mongoUrl);
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Successfully connected to the Mongo database");
}).catch(err => {
  console.log('Failed to connect to the Mongo database');
  process.exit();
});

app.get('/', (req, res) => {
  res.send('<h1>Mongo Server is running</h1>');
});

/**
 * Socket server
 */
const socketServer = http.createServer(express);
const io = socketio(socketServer, {
  cors: {
    origins: ['http://localhost:4200']
  }
});

// socket.broadcast.emit send message to all clients connected, except current user
// io.emit send message to all clients
// socket.emit send message to the client
io.on("connection", socket => {
  // user's token
  const token = socket.handshake.auth.token;
  console.log(`socket connection with username: ${token}`);

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
});

// Initialize our websocket server on port 3000
const SOCKET_PORT = process.env.PORT || 3000;

socketServer.listen(SOCKET_PORT, () => {
  console.log(`started chat-server on port: ${SOCKET_PORT}`);
});
