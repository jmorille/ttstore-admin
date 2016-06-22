'use strict';

const Hapi = require('hapi');
const Good = require('good');

// Config
const Config = require("./config");
const Providers = Config.get('/provider');
const ConfigApp = Config.get('/app');


// Server
const server = new Hapi.Server();
server.connection({
  port: ConfigApp.port,
    routes: {
      plugins: {
        hapiAuthorization: { roles: ['ADMIN'] }
      }
    }
});


// Declare plugins
const plugins = [
  {register: Good, options: ConfigApp.console},
  {register: require('hapi-auth-jwt2')},
  {register: require('./plugins/hapi-es'), options: Config.get('/elastic').client},
  {register: require('hapi-authorization'), options: Config.get('/authorization').client},

  { register: require('./routes/universe/universes.js') }
];


// Register plugins, and start the server if none of them fail
server.register(plugins, function (err) {
  if (err) { throw err; }

  // Auth Plugins
  server.auth.strategy('jwt', 'jwt', 'required',  {
    key:Providers.jwt.jwtSecret,
    validateFunc: require('./security/auth_jwt_validate.js')
  });

  // authorization
  //server.connection({
  //  routes: {
  //    plugins: {
  //      hapiAuthorization: { roles: ['ADMIN'] }
  //    }
  //  }
  //});

  // Server Start
  server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});
