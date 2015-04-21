var Hapi = require('hapi');
var Good = require('good');

var routes = require('./routes');
var constants = require('./config/constants.js');

// Config
var port = constants.app['port'];

// Http Server
var server = new Hapi.Server(); //{ debug: { request: ['info', 'error'] } }
server.connection({port: port});




var plugins = [
  {register: require('./plugins/hapi-auth-basic') },
  {register: require('hapi-auth-jwt2') },
  {register: require('./plugins/hapi-es'), options: constants.es},
  {register: require('hapi-swagger'), options: constants.swagger},
  {register: require('tv'), options: constants.tv },
  {
    register: Good,
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log: ['error', 'info', 'debug']
        }
      }]
    }
  }
];


server.register(plugins, function (err) {
  if (err) {
    console.log('error when registering modules', error);
    throw err; // something bad happened loading the plugin
  }


  server.auth.strategy('basic', 'basic', {
    validateFunc: require('./security/auth_basic_validate.js')
  });
  //server.auth.strategy('jwt', 'jwt', 'required',  {
  //  key: constants.app.jwtSecret,
  //  validateFunc: require('./security/auth_jwt_validate.js')
  //});


// Add all the routes within the routes folder
  for (var route in routes) {
    //console.log('-- Route', routes[route]);
    server.route(routes[route]);
  }

  server.start(function (err) {
    if (err) {
      console.log('error when starting server', error);
    }
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});

//server.start();
