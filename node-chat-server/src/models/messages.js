const moment = require('moment');

function formatMessage(username, roomId, text) {
  return {
    username,
    roomId,
    text,
    time: moment().format('h:mm a')
  }
}

module.exports = formatMessage;
