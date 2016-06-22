'use strict';
const fs = require('fs');

const Hapi = require('hapi');
const Http2 = require('http2');
const Good = require('good');

const routes = require('./routes');
const Config = require("./config");
const Providers = Config.get('/provider');
const ConfigApp = Config.get('/app');

console.log('-----', fs.realpathSync('./cert/'));

// Http2
var tls = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.crt')
};
//let listener = Http2.createServer(tls);
//if (!listener.address) {
//  listener.address = function() {
//    return this._server.address()
//  }
//};

// Http Server
const server = new Hapi.Server(); //{ debug: { request: ['info', 'error'] } }
server.connection({ port: ConfigApp.port });
//server.connection({ port: 8001, tls: tls  });

//server.connection({
//  listener: listener,
//  port: ConfigApp.port,
//  tls: true
//});


var plugins = [
  {register: Good, options: ConfigApp.console},

  {register: require('bell')},
  {register: require('./plugins/hapi-auth-basic')},
  {register: require('./plugins/hapi-auth-google-tokens'), options:  Providers.google},
  {register: require('hapi-auth-jwt2')},
  {register: require('./plugins/hapi-es'), options: Config.get('/elastic').client}
];

if (true) {
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

  server.auth.strategy('basic', 'basic', {
    validateFunc: require('./security/auth_basic_validate.js')
  });
  server.auth.strategy('google-tokens', 'google-tokens', {
    validateFunc: require('./security/auth_google_validate.js')
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
