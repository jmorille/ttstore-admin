const Hapi = require('hapi');
const Good = require('good');

const routes = require('./routes');
const Config = require("./config");
const Providers = Config.get('/provider');
const ConfigApp = Config.get('/app');


// Http Server
const server = new Hapi.Server(); //{ debug: { request: ['info', 'error'] } }
server.connection({port: ConfigApp.port});


const plugins = [
  {register: Good, options: ConfigApp.console},
  {register: require('./plugins/hapi-es'), options: Config.get('/elastic').client},

  {register: require('hapi-auth-basic')},
  {register: require('bell')},
  {register: require('hapi-auth-jwt2')}
];

if (false) {
  plugins.push({register: require('inert')});
  plugins.push({register: require('vision')});
  plugins.push({register: require('hapi-swagger'), options: Config.get('/swagger')});
  plugins.push({register: require('tv'), options: Config.get('/tv')});
}

server.register(plugins, function (err) {
  if (err) {
    console.log('error when registering modules', error);
    throw err; // something bad happened loading the plugin
  }

  //server.auth.strategy('google', 'bell', Providers.google);

  server.auth.strategy('simple', 'basic', {
    validateFunc: require('./security/auth_basic_validate.js')
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
