'use strict';

var Boom = require('boom'); // error handling https://github.com/hapijs/boom
var bcrypt = require('bcrypt'); // import the module we are using to encrypt passwords

var jwtSign = require('../security/auth_jwt_sign.js');
var userController = require('./../controllers/user');

var google = require('googleapis');
//google.options({ proxy: 'http://proxy.example.com', auth: auth });

var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
var oauth2 = google.oauth2('v2');
var Config = require("../config");
var GoogleProviders = Config.get('/provider').google;

// https://github.com/ideaq/hapi-auth-jwt2/blob/master/example/simple_server.js
module.exports = function (plugin, options, next) {
  console.log('authController initialisation');
  return [
    {
      method: 'GET',
      path: '/hello',
      handler: function (req, reply) {
        console.log('Hello  Request Auth ', req.auth);
        reply(req.auth);
      },
      config: {
        auth: 'jwt'
      }
    },
    {
      method: 'GET',
      path: '/login/jwt',
      handler: function (request, reply) {
        reply({text: 'You used a Token!'})
          .header("Authorization", request.headers.authorization);
      },
      config: {
        auth: 'jwt',
        tags: ['api', 'login'],
        description: 'Login an User with Auth'
      }
    },
    {
      method: 'POST',
      path: '/login',
      handler: function (request, reply) {
        console.log('Login  Request Auth ', request.auth);
        //reply({text: 'You Succefully Login and Attach a JWT token '})
        //  .header("Authorization", request.headers.authorization);
        jwtSign(request, function (token, res) {
          return reply(res).header("Authorization", token);
        });
      },
      config: {
        auth: 'basic',
        tags: ['api', 'login'],
        description: 'Login an User'
      }
    },
    {
      method: 'POST',
      path: '/s/login/google',
      handler: function (request, reply) {
        // https://github.com/google/google-api-nodejs-client
        console.log('Login  Request Paylaod ', request.payload);
        var tokens = request.payload;
        //reply({text: 'You Succefully Login and Attach a JWT token '})
        //  .header("Authorization", request.headers.authorization);
        var accessToken = tokens.access_token,
          refreshToken = tokens.code || null; // refresh_token


        var oauth2Client = new OAuth2(GoogleProviders.clientId, GoogleProviders.clientSecret, GoogleProviders.redirectUrl);
        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        oauth2.userinfo.get({
          auth: oauth2Client
        }, function (err, profile) {
          console.log('Google userinfo error', err);
          console.log('Google userinfo profile', profile);
        });
        plus.people.get({userId: 'me', auth: oauth2Client}, function (err, response) {
          console.log('Google people error', err);
          console.log('Google people profile', response);
        });
        oauth2.tokeninfo({
          access_token: tokens.access_token,
          auth: oauth2Client
        }, function (err, tokens) {
          console.log('tokeninfo error', err);
          console.log('tokeninfo', tokens);
        });

        //jwtSign(request, function (token, res) {
        //  return reply(res).header("Authorization", token);
        //});
      },
      config: {
        auth: false,
        tags: ['api', 'login', 'googleapi'],
        description: 'Login an User'
      }
    },
    {
      method: 'POST',
      path: '/changePassword/{userId}',
      handler: userController.updatePasswordById,
      config: {
        tags: ['api', 'login'],
        description: 'Login an User'
      }
    }
  ]
}();
//         auth: 'basic',
