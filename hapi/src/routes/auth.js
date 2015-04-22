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
      path: '/signin',
      handler: function (req, reply) {
        var es = request.server.methods.es;
        var email = req.payload.email;
        var password = req.payload.password;

        var user = {
          index: "users",
          type: "user",
          body: {
            email: email
          }
        };
        var optExist = {
          index: "users",
          type: "user",
          "query": {
            "term": {"email": email}
          }
        };
        es.searchExists(optExist, function (err, res) {
          if (err) {
            return reply(err, res);
          }
          if (res.found) {
            return reply(Boom.badRequest('Email address already registered'));
          }
          userController.passwordEncode(password, function (err, hash) {
            Hoek.assert(res.created, 'User NOT Registered!'); // only if DB fails!
            JWT(req, function (token, esres) {
              return reply(res).header("Authorization", token);
            }); // Asynchronous
          });

        });

      },
      config: {
        auth: 'basic',
        tags: ['api', 'login'],
        description: 'Login an User'
      }
    }
  ]
}();
