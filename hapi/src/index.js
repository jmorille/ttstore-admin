var Hapi = require('hapi');
var Good = require('good');

var routes = require('./routes');
var Config = require("./config");
var Providers = Config.get('/provider');
var ConfigApp = Config.get('/app');


// Http Server
var server = new Hapi.Server(); //{ debug: { request: ['info', 'error'] } }
server.connection({port: ConfigApp.port});


var plugins = [
  {register: Good, options: ConfigApp.console},
  {register: require('bell')},
  {register: require('./plugins/hapi-auth-basic')},
  {register: require('hapi-auth-jwt2')},
  {register: require('./plugins/hapi-es'), options: Config.get('/elastic').client}
];

if (true) {
  plugins.push({register: require('tv'), options: Config.get('/tv')});
  plugins.push({register: require('hapi-swagger'), options: Config.get('/swagger')});
}

server.register(plugins, function (err) {
  if (err) {
    console.log('error when registering modules', error);
    throw err; // something bad happened loading the plugin
  }

  //server.auth.strategy('google', 'bell', Providers.google);

  server.auth.strategy('basic', 'basic', {
    validateFunc: require('./security/auth_basic_validate.js')
  });
  server.auth.strategy('jwt', 'jwt', 'required',  {
    key:Providers.jwt.jwtSecret,
    validateFunc: require('./security/auth_jwt_validate.js')
  });

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
