'use strict';
// Fork of https://github.com/hapijs/hapi-auth-basic/blob/master/lib/index.js
// Open Issue https://github.com/hapijs/hapi-auth-basic/issues/30

var Boom = require('boom');
var Hoek = require('hoek');


// Declare internals

var internals = {};


exports.register = function (plugin, options, next) {

  plugin.auth.scheme('basic', internals.implementation);
  next();
};


exports.register.attributes = {
  name: 'hapi-auth-basic',
  version: '2.0.0'
};


internals.implementation = function (server, options) {
  console.log('----------------- hapi-auth-basic');
  Hoek.assert(options, 'Missing basic auth strategy options');
  Hoek.assert(typeof options.validateFunc === 'function', 'options.validateFunc must be a valid function in basic scheme');

  var settings = Hoek.clone(options);

  var scheme = {
    authenticate: function (request, reply) {
      console.log('----------------- hapi-auth-basic authenticate');
      var req = request.raw.req;
      var authorization = req.headers.authorization;
      if (!authorization) {
        return reply(Boom.unauthorized(null, 'Basic'));
      }

      var parts = authorization.split(/\s+/);

      if (parts[0].toLowerCase() !== 'basic') {
        return reply(Boom.unauthorized(null, 'Basic'));
      }

      if (parts.length !== 2) {
        return reply(Boom.badRequest('Bad HTTP authentication header format', 'Basic'));
      }

      var credentialsPart = new Buffer(parts[1], 'base64').toString();
      var sep = credentialsPart.indexOf(':');
      if (sep === -1) {
        return reply(Boom.badRequest('Bad header internal syntax', 'Basic'));
      }

      var username = credentialsPart.slice(0, sep);
      var password = credentialsPart.slice(sep + 1);

      if (!username && !settings.allowEmptyUsername) {
        return reply(Boom.unauthorized('HTTP authentication header missing username', 'Basic'));
      }

      settings.validateFunc(request, username, password, function (err, isValid, credentials) {
        console.log('----------------- hapi-auth-basic authenticate validateFunc');
        credentials = credentials || null;
        console.log('----------------- hapi-auth-basic authenticate validateFunc ', credentials);
        if (err) {
          return reply(err, null, { credentials: credentials });
        }

        if (!isValid) {
          return reply(Boom.unauthorized('Bad username or password', 'Basic'), null, { credentials: credentials });
        }

        if (!credentials ||
          typeof credentials !== 'object') {

          return reply(Boom.badImplementation('Bad credentials object received for Basic auth validation'));
        }

        // Authenticated

        return reply.continue({ credentials: credentials });
      });
    }
  };

  return scheme;
};
