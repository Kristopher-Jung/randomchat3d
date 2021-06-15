const userController = require('./controllers/userController');

const router = function(app) {
  // home route
  app.get('/', (req, res) => {
    res.send('<h1>Mongo Server is running</h1>');
  });

  // mongo db interaction controller
  app.get('/user/:username/:password', userController.create);
  app.get('/user/:username', userController.findOne);

  // should be the last
  app.get('*', (req, res) => {
    res.send('<h1>Invalid Mongo route!</h1>');
  });
};

module.exports = router;
