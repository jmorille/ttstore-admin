'use strict';

var Boom = require('boom'); // error handling https://github.com/hapijs/boom
var bcrypt = require('bcrypt'); // import the module we are using to encrypt passwords

var JwtSign = require('../security/auth_jwt_sign.js');
var userController = require('./../controllers/user');

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
        JwtSign(request, function (token, res) {
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
