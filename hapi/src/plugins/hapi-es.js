// @see https://github.com/entrinsik-org/hapi-elasticsearch/blob/master/lib/index.js


var Boom = require('boom'); // error handling https://github.com/hapijs/boom
var hoek = require('hoek'); // hapi utilities https://github.com/hapijs/hoek
var es = require('elasticsearch');


var internals = {}; // Declare internals >> see: http://hapijs.com/styleguide
//  log: require('./logger'),
internals.defaultSettings = {
    host: 'http://localhost:9200',
    apiVersion: '1.1'
};

exports.register = function (server, options, next) {
  var settings = hoek.applyToDefaults(internals.defaultSettings, options);
  server.log(['hapi-es', 'info'], 'Initializing elasticsearch connection with settings ' + JSON.stringify(settings));
  var client = new es.Client(settings);
  server.log(['hapi-es', 'info'], 'Created client');
  console.log(['hapi-es', 'info'], 'Created client');
  server.expose('client', client);

  next();
};

exports.register.attributes = {     // hapi requires attributes for a plugin.
  name: 'hapi-es',
  version: '1.0.0'
};


