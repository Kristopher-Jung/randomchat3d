const UserModel = require('../models/mongooseSchema');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.create = (req, res) => {
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
            password: hash
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

exports.findOne = (req, res) => {
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
  UserModel.find({ username: req.params.username }).then(users => {
    if(users.length > 1) {
      return res.status(500).send({
        message: `More than one user found given username:${req.params.username}`
      });
    } else if(users.length === 0) {
      return res.send({
        message: `No user found for username${req.params.username}`
      });
    }
    const user = users[0];
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
          message: null
        });
      }
    });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({
      message: "unexpected MongoDB error caught: " + err.message
    });
  });
};

