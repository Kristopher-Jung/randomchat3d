require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoRouter = require('./routers/mongoRouter');
const socketRouter = require('./routers/socketRouter')

const runEnv = process.env.NODE_ENV || 'dev';
console.log(`Chat node serve runs in: ${runEnv} env`);
let corsOriginUI;
if(runEnv === 'dev') {
  corsOriginUI = process.env.LOCAL_WEBAPP_ORIGIN;
} else {
  corsOriginUI = process.env.PRODUCTION_WEBAPP_ORIGIN;
}

/**
 * MongoDB server
 */
app.use(cors());
TODO
app.use(cors({
  origin: corsOriginUI
}));
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const MONGO_PORT = process.env.MONGO_PORT || 5000;
app.listen(MONGO_PORT, () => {
  console.log(`started mongo-server on port: ${MONGO_PORT}`);
});
mongoRouter(app);

//Mongo DB Connection
mongoose.promise = global.Promise;
const mongoUrl = process.env.MONGO_CONNECTION_STRING;
console.log(mongoUrl);
mongoose.connect(mongoUrl, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).then(() => {
  console.log("Successfully connected to the Mongo database");
}).catch(err => {
  console.log('Failed to connect to the Mongo database');
  process.exit();
});

/**
 * Socket server
 */
const socketServer = http.createServer(express);
const io = socketio(socketServer, {
  cors: {
    origins: [corsOriginUI]
  }
});
io.on("connection", socket => {
  // user's token
  const token = socket.handshake.auth.token;
  console.log(`socket connection with username: ${token}`);
  socketRouter(socket, io, token);
});

// Initialize our websocket server on port 3000
const SOCKET_PORT = process.env.SOCKET_PORT || 3000;

socketServer.listen(SOCKET_PORT, () => {
  console.log(`started chat-server on port: ${SOCKET_PORT}`);
});
