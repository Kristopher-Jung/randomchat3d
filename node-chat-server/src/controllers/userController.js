const UserModel = require('../models/mongooseSchema');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { v4: uuidv4 } = require('uuid');

exports.createUser = (req, res) => {
  console.log(`signup requested by ${req.params.username}`);
  if (!req.params.username) {
    return res.status(400).send({
      message: "User name is too short!"
    });
  }
  const password = req.body.password;
  if (!password) {
    return res.send.send({
      message: "User needs to set password"
    });
  } else {
    if (password.length < 4) {
      return res.send({
        message: "User password is too short, at least length 4 required"
      });
    }
  }
  bcrypt.genSalt(saltRounds, function (saltError, salt) {
    if (saltError) {
      return res.status(500).send({
        message: 'Bcrypt:Salt failed!'
      });
    } else {
      bcrypt.hash(password, salt, function (hashError, hash) {
        if (hashError) {
          return res.status(500).send({
            message: 'Bcrypt:Hashing password failed!'
          });
        } else {
          const user = new UserModel({
            username: req.params.username,
            character: 'Kaya',
            password: hash,
            roomId: null,
            activeInd: false
          });
          user.save()
            .then(data => {
              res.send(null);
            }).catch(err => {
            if (err.code === 11000) {
              return res.send({
                message: "Username already taken!"
              });
            } else {
              res.status(500).send({
                message: err.message
              });
            }
          })
        }
      });
    }
  })
};

exports.authUser = (req, res) => {
  const password = req.body.password;
  // console.log(password);
  if (!password) {
    return res.send.send({
      message: "User needs to set password"
    });
  } else {
    if (password.length < 4) {
      return res.send({
        message: "User password is too short, at least length 4 required"
      });
    }
  }
  UserModel.findOneAndUpdate({ username: req.params.username }, {activeInd: true}).then(user => {
    if(!user) {
      return res.send({
        message: `No user found for username: ${req.params.username}`
      });
    } else {
      if(user.activeInd) {
        return res.send({
          message: `username: ${req.params.username} is already logged in!`
        });
      }
    }
    bcrypt.compare(password, user.password, function (error, isMatch) {
      if (error) {
        return res.status(500).send({
          message: 'Bcrypt:compare failed'
        });
      } else if (!isMatch) {
        return res.send({
          message: 'Entered password is wrong!'
        });
      } else {
        return res.send({
          message: null,
          character: user.character
        });
      }
    });
  }).catch(err => {
    return res.status(500).send({
      message: "unexpected MongoDB error caught: " + err.message
    });
  });
};

exports.updateChar = (req, res) => {
  const username = req.params.username;
  const char = req.params.char;
  console.log(`Update char for username:${username}, char:${char}`)
  UserModel.findOneAndUpdate({username: username}, {character: char}, {new: true},
    (err, doc) => {
      if (err) {
        return res.status(500).send({
          message: `couldn't update char due to mongoDB error, char:${char}, username:${username}`
        });
      } else {
        if(doc) {
          // console.log(doc);
          return res.send(doc);
        } else {
          return res.send({
            message: `User not found, username:${username}`
          });
        }
      }
    });
};

exports.createChat = (req, res) => {
  const username = req.params.username;
  const roomId = req.params.roomId;
  console.log(`Create chat room requested for username:${username}, room:${roomId}`)
  UserModel.findOneAndUpdate({username: username}, {roomId: roomId}, {new: true},
    (err, doc) => {
      if (err) {
        return res.status(500).send({
          message: `couldn't create a chat room due to mongoDB error, roomId:${roomId}, username:${username}`
        });
      } else {
        if(doc) {
          return res.send(doc);
        } else {
          return res.send({
            message: `User not found, username:${username}`
          });
        }
      }
    });
};

exports.leaveChat = (req, res) => {
  const username = req.params.username;
  UserModel.findOneAndUpdate({username: username}, {roomId: null, activeInd: false}, {new: true},
    (err, doc) => {
      if (err) {
        return res.status(500).send({
          message: `couldn't leave a chat room, username:${username}`
        });
      } else {
        if(doc) {
          return res.send(doc);
        } else {
          return res.send({
            message: `User not found, username:${username}`
          });
        }
      }
    });
};

exports.joinChat = (req, res) => {
  UserModel.aggregate([
    {
      "$group" : {_id:"$roomId", count: {$sum:1}}
    },
    {
      "$match": {_id: {"$ne":null}, count: {"$lte":1}}
    },
  ], (err, rooms) => {
    if(err) {
      return res.status(500).send({
        message: `Could not join or create a new chat for user: ${req.params.username} because of DB error`
      });
    }
    if(rooms.length > 0) {
      const roomSize = rooms.length;
      const rand = getRandomInteger(0, roomSize);
      req.params.roomId = rooms[rand];
      return this.createChat(req, res);
    } else {
      req.params.roomId = uuidv4();
      return this.createChat(req, res);
    }
  });
};

function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
