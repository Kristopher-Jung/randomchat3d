var cors = require('cors')
const userController = require('../controllers/userController');

const router = function (app) {
  // home route
  app.get('/', cors(), (req, res) => {
    res.send('<h1>Mongo Server is running</h1>');
  });

  // mongo db interaction controller
  //create an user
  app.post('/user/signUp/:username', cors(), userController.createUser);
  //user password auth
  app.post('/user/auth/:username', cors(), userController.authUser);
  //create chat room
  app.get('/user/createChat/:username/:roomId', cors(), userController.createChat);
  //sign out
  app.get('/user/signOut/:username', cors(), userController.signOut);
  //leave Room
  app.get('/user/leaveRoom/:username', cors(), userController.leaveRoom);
  //join chat room
  app.get('/user/joinChat/:username', cors(), userController.joinChat)
  //Update char
  app.get('/user/updateChar/:username/:char', cors(), userController.updateChar)

  // should be the last
  app.get('*', cors(), (req, res) => {
    res.send('<h1>Invalid Mongo route!</h1>');
  });
};

module.exports = router;
