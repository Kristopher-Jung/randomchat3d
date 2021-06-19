const moment = require('moment');
const ControllerEnum = Object.freeze({
  "DISPLAY":0,
  "AWAIT":1,
  "COMPLETE":2,
  "SOCKET_STAT":3,
  "SERVER_STAT":4
});

function formatMessage(username, roomId, text, controllerEnum) {
  return {
    username,
    roomId,
    text,
    controllerEnum,
    time: moment().format('h:mm a')
  }
}

module.exports = {
  formatMessage,
  ControllerEnum
};
