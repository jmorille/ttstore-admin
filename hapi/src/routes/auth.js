'use strict';

var Boom = require('boom'); // error handling https://github.com/hapijs/boom
var bcrypt = require('bcrypt'); // import the module we are using to encrypt passwords

var JWT = require('../security/auth_jwt_sign.js');
var userController = require('./../controllers/user');


module.exports = function (plugin, options, next) {
  console.log('authController initialisation');
  return [
    {
      method: 'POST',
      path: '/login',
      handler: function (request, reply) {
        JWT(request, function (token, res) {
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
