// Declare internals


var Boom = require('boom');
var Hoek = require('hoek');


var google = require('googleapis');
//google.options({ proxy: 'http://proxy.example.com', auth: auth });

var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
var oauth2 = google.oauth2('v2');


var internals = {};




internals.implementation = function (server, options) {
  console.log('----------------- hapi-auth-basic');
  Hoek.assert(options, 'Missing basic auth strategy options');
  Hoek.assert(typeof options.validateFunc === 'function', 'options.validateFunc must be a valid function in basic scheme');

  Hoek.assert(options.clientId, 'Missing options.clientId must be a valid Google Client Id options');
  Hoek.assert(options.clientSecret, 'Missing options.clientSecret  must be a valid Google Client Secret  options');

  var settings = Hoek.clone(options);


  var scheme = {
    authenticate: function (request, reply) {
      console.log('----------------- hapi-auth-google-tokens authenticate');
      var payload = request.payload;
      var accessToken = payload.access_token,
        refreshToken = payload.code || null; // refresh_token
      if (!accessToken) {
        return reply(Boom.unauthorized(null, 'Google Tokens'));
      }



      oauth2.tokeninfo({
        access_token: accessToken
      }, function (err, tokens) {
        if (err) {
          console.log('tokeninfo Error', err);
          return reply(Boom.unauthorized(null, 'Google Tokens'), err);
        }
        // CHeck Audience == clientId
        // https://developers.google.com/identity/protocols/OAuth2UserAgent#validatetoken
        if (tokens.audience !== settings.clientId) {
          return reply(Boom.unauthorized(null, 'Google Tokens'));
        }
        console.log('tokeninfo', tokens);
      });



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



exports.register = function (plugin, options, next) {
  plugin.auth.scheme('google-tokens', internals.implementation);
  next();
};


exports.register.attributes = {
  name: 'hapi-auth-google-tokens',
  version: '1.0.0'
};
