// @see https://github.com/entrinsik-org/hapi-elasticsearch/blob/master/lib/index.js
'use strict';

var Boom = require('boom'); // error handling https://github.com/hapijs/boom
var Hoek = require('hoek'); // hapi utilities https://github.com/hapijs/hoek
var es = require('elasticsearch');


var internals = {}; // Declare internals >> see: http://hapijs.com/styleguide


internals.defaultSettings = {
  host: 'http://localhost:9200',
  apiVersion: '1.5',
  method_prefix: 'es'
};

internals.wrapError = function (err, res) {
  if (!err) {
    return err;
  }
  if (res.status) {
    return Boom.create(res.status, res.error, options);
  }
  if (res.hasOwnProperty('found') && res.found === false) {
    return Boom.notFound(JSON.stringify(err), res);
  }
  return Boom.badImplementation(JSON.stringify(err), res);
};

exports.register = function (server, options, next) {

  // --- Es Settings
  // --- ----------
  var settings = Hoek.applyToDefaults(internals.defaultSettings, options);
  settings.log = require('elasticsearch-hapi-logger')(server);
  server.log(['es', 'info'], 'Initializing Elasticsearch connection with settings ' + JSON.stringify(settings));

  // --- Es Client
  // --- ----------
  var client = new es.Client(settings);
  server.log(['es', 'info'], 'Created Elastic client');
  server.expose('client', client);
  // Expose Search

  //server.handler('essearch', function (route, options) {
  //  return function (request, reply) {
  //    var params = request.query;
  //
  //    if (options.index) params.index = _.isFunction(options.index) ? options.index.call(null, request) : options.index;
  //    if (options.type) params.type = _.isFunction(options.type) ? options.type.call(null, request) : options.type;
  //    if (request.payload) params.body = request.payload;
  //
  //    client.search(params, reply);
  //  };
  //});

  // --- Register client Api
  // --- --------------------
  ['search', 'searchExists', 'get', 'update', 'create', 'delete', 'index', 'exists', 'suggest'].forEach(function (item) {
    server.method({
      name: settings.method_prefix + '.' + item,
      method: function (options, next) {
        client[item](options, function (err, res) {
          next(internals.wrapError(err), res);
        });
      },
      options: {}
    });
  });

  // End Register
  next();
};

exports.register.attributes = {     // hapi requires attributes for a plugin.
  name: 'hapi-es',
  version: '1.0.0'
};


