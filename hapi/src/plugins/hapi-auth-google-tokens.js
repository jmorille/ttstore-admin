// Declare internals


var Boom = require('boom');
var Hoek = require('hoek');


var google = require('googleapis');
//google.options({ proxy: 'http://proxy.example.com', auth: auth });

var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
var oauth2 = google.oauth2('v2');


var internals = {};
internals.defaultSettings = {};


internals.implementation = function (server, options) {
  var settings = Hoek.applyToDefaults(internals.pluginSettings, options);

  Hoek.assert(settings, 'Missing basic auth strategy settings');
  Hoek.assert(typeof settings.validateFunc === 'function', 'settings.validateFunc must be a valid function in basic scheme');

  Hoek.assert(settings.clientId, 'Missing settings.clientId must be a valid Google Client Id settings');
  Hoek.assert(settings.clientSecret, 'Missing settings.clientSecret  must be a valid Google Client Secret  settings');

  // var settings = Hoek.clone(options);


  var scheme = {
    authenticate: function (request, reply) {
      console.log('----------------- hapi-auth-google-tokens authenticate');
      var requestRaw = request.raw.req;
      var authorization = requestRaw.headers.authorization;
      if (!authorization) {
        return reply(Boom.unauthorized(null, 'Missing authorization token'));
      }


      // strip pointless "Bearer " label & any whitespace > http://git.io/xP4F
      var accessToken = authorization.replace(/Bearer/gi, '').replace(/ /g, '');


      // Check tocken
      if (!accessToken) {
        return reply(Boom.unauthorized(null, 'Missing authorization token'));
      }
      // attempt to verify the token *asynchronously*
      oauth2.tokeninfo({
        access_token: accessToken
      }, function (err, tokeninfo) {
        if (err || !tokeninfo) {
          console.log('tokeninfo Error', err);
          return reply(Boom.unauthorized(null, 'Google Tokens'), err);
        }
        // CHeck Audience == clientId
        // https://developers.google.com/identity/protocols/OAuth2UserAgent#validatetoken
        if (tokeninfo.audience !== settings.clientId) {
          return reply(Boom.unauthorized(null, 'Google Tokens'));
        }
        if (tokeninfo.expires_in < 1) {
          return reply(Boom.unauthorized(null, 'Expired Google Tokens'));
        }
        //console.log('tokeninfo', tokeninfo);
        settings.validateFunc(request, tokeninfo, function (err, isValid, credentials) {
          credentials = credentials || null;
          if (err) {
            return reply(err, null, {credentials: credentials});
          }
          if (!isValid) {
            return reply(Boom.unauthorized('Bad Google Tokens', 'Bearer'), null, {credentials: credentials});
          }
          if (!credentials ||
            typeof credentials !== 'object') {

            return reply(Boom.badImplementation('Bad credentials object received for Google auth token'));
          }
          // Authenticated
          return reply.continue({credentials: credentials});
        });

      });

    }
  };

  return scheme;
};


exports.register = function (plugin, options, next) {
  var settings = Hoek.applyToDefaults(internals.defaultSettings, options);
  internals.pluginSettings = settings;
  plugin.auth.scheme('google-tokens', internals.implementation);
  next();
};


exports.register.attributes = {
  name: 'hapi-auth-google-tokens',
  version: '0.0.1'
};
