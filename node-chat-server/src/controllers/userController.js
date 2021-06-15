const { UserModel } = require('../models/mongooseSchema');

exports.create = (req, res) => {
  if(!req.params.username) {
    return res.status(400).send({
      message: "User name is too short!"
    });
  }
  if(!req.params.password) {
    return res.status(400).send({
      message: "User password is too short!"
    });
  }
  const user = new UserModel({
    username: req.params.user,
    password: req.params.password
  });
  user.save()
    .then(data => {
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message: err.message
      });
  })
};

exports.findAll = (req, res) => {
  return res.status(500).send({
    message: "Not Supported yet!"
  });
};

exports.findOne = (req, res) => {
  if(!req.params.username) {
    return res.status(400).send({
      message: "User name is too short!"
    });
  }
  UserModel.findById(req.params.username)
    .then(user => {
      if(!user) {
        return res.status(404).send({
          message: "User not found with id " + req.params.username
        })
      }
      res.send(user);
    }).catch(err => {
      if(err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "User not found with ObjectId " + req.params.username
        });
      }
      return res.status(500).send({
        message: "Error retrieving user with id " + req.params.username
      });
  });
};

exports.update = (req, res) => {
  return res.status(500).send({
    message: "Not Supported yet!"
  });
};

exports.delete = (req, res) => {
  return res.status(500).send({
    message: "Not Supported yet!"
  });
};
