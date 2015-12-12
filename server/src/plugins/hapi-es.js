// @see https://github.com/entrinsik-org/hapi-elasticsearch/blob/master/lib/index.js
'use strict';

const Boom = require('boom'); // error handling https://github.com/hapijs/boom
const Hoek = require('hoek'); // hapi utilities https://github.com/hapijs/hoek
const es = require('elasticsearch');


var internals = {}; // Declare internals >> see: http://hapijs.com/styleguide


internals.defaultSettings = {
  host: 'http://localhost:9200',
  apiVersion: '2.1',
  method_prefix: 'es'
};

internals.wrapError = function (err, res) {
  if (!err) {
    return err;
  }
  //console.log('-- err', err);
  //console.log('-- res', res);
  if (res) {
    // Generate Error From res data
    var resMsg = res.error ? res.error : (  err.message ? err.message : JSON.stringify(err) );
    if (res.status) {
      return Boom.create(res.status, resMsg, res);
    }
    if (res.hasOwnProperty('found') && res.found === false) {
      return Boom.notFound(resMsg, res);
    }
  }
  // Generate Error From error data
  var errStatus = err.status ? err.status : 500;
  var errMsg = err.message ? err.message : JSON.stringify(err);
  return Boom.create(errStatus, errMsg, res);
};

internals.validateQuery = {};
internals.validateQuery.search = function (options, next) {
  if (options.body && options.body.query) {
    // Valid Query
    return true;
  } else if (options.q) {
    // Valid Query
    return true;
  }
  return false;
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
          next(internals.wrapError(err, res), res);
        });
      },
      options: {}
    });
  });

  // --- Register App Api
  // --- --------------------
  server.method({
    name: settings.method_prefix + '.findOne',
    method: function (options, next) {
      client.search(options, function (err, res) {
        if (err || !res) {
          return next(internals.wrapError(err, res), res);
        }
        var result = res.hits;
        if (result.total === 1) {
          var entity = result.hits[0];
          return next(err, entity);
        } else if (result.total > 1) {
          return next( Boom.notFound('Too many result', res), res);
        } else {
          return next( Boom.notFound(), res);
        }
      });
    },
    options: {}
  });

  // End Register
  next();
};

exports.register.attributes = {     // hapi requires attributes for a plugin.
  name: 'hapi-es',
  version: '1.0.0'
};


