const userController = require('../controllers/userController');

const router = function(app) {
  // home route
  app.get('/', (req, res) => {
    res.send('<h1>Mongo Server is running</h1>');
  });

  // mongo db interaction controller
  //create an user
  app.post('/user/signUp/:username', userController.createUser);
  //user password auth
  app.post('/user/auth/:username', userController.authUser);
  //create chat room
  app.get('/user/createChat/:username/:roomId', userController.createChat);
  //leave chat room
  app.get('/user/leaveChat/:username', userController.leaveChat);
  //join chat room
  app.get('/user/joinChat/:username', userController.joinChat)

  // should be the last
  app.get('*', (req, res) => {
    res.send('<h1>Invalid Mongo route!</h1>');
  });
};

module.exports = router;
