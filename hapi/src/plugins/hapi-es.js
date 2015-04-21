// @see https://github.com/entrinsik-org/hapi-elasticsearch/blob/master/lib/index.js
'use strict';

var Boom = require('boom'); // error handling https://github.com/hapijs/boom
var hoek = require('hoek'); // hapi utilities https://github.com/hapijs/hoek
var es = require('elasticsearch');


var internals = {}; // Declare internals >> see: http://hapijs.com/styleguide

//      log: require('./hapi-es-logger'),

internals.defaultSettings = {
  host: 'http://localhost:9200',
   apiVersion: '1.5'
};

exports.register = function (server, options, next) {
  // Es Settings
  var settings = hoek.applyToDefaults(internals.defaultSettings, options);
  settings.log = require('elasticsearch-hapi-logger')(server);
  server.log(['hapi-es', 'info'], 'Initializing elasticsearch connection with settings ' + JSON.stringify(settings));
  // Es Client
  var client = new es.Client(settings);
  server.log(['hapi-es', 'info'], 'Created client');
  server.expose('client', client);
  // Expose Search

  server.handler('essearch', function (route, options) {
    return function (request, reply) {
      var params = request.query;

      if (options.index) params.index = _.isFunction(options.index) ? options.index.call(null, request) : options.index;
      if (options.type) params.type = _.isFunction(options.type) ? options.type.call(null, request) : options.type;
      if (request.payload) params.body = request.payload;

      client.search(params, reply);
    };

  });

  ['search', 'update', 'create', 'delete', 'exists', 'suggest', 'index'].forEach(function (item) {
    server.method({
      name: 'es.'.item,
      method: function (options, next) {
        client[item](options, function (err, res) {
          if (err) {
            var error = Boom.create(res.status, res.error, options);
            next(error, null);
          } else {
            next(err, res);
          }
        });
      },
      options: {}
    });
  });

  server.method({
    name: 'essearch',
    method: function (options, next) {
      client.search(options, function (err, res) {
        if (err) {
          var error = Boom.create(res.status, res.error, options);
          next(error, null);
        } else {
          next(err, res);
        }
      });
    },
    options: {}
  });

  server.method({
    name: 'esupdate',
    method: function (options, next) {
      client.update(options, function (err, res) {
        if (err) {
          var error = Boom.create(res.status, res.error, options);
          next(error, null);
        } else {
          next(err, res);
        }
      });
    },
    options: {}
  });

  // Next
  next();
};

exports.register.attributes = {     // hapi requires attributes for a plugin.
  name: 'hapi-es',
  version: '1.0.0'
};


