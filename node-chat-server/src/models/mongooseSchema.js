const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
      dropDups: true
    }
  },
  character: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: false
  },
  activeInd: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
