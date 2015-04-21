'use strict';

var JWT = require('../security/auth_jwt_sign.js');

module.exports = function (plugin, options, next) {
  console.log('authController initialisation');
  return [
    {
      method: 'POST',
      path: '/login',
      handler: function (request, reply) {
        JWT(request, function(token, res){
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
      handler: function (request, reply) {
        var options =  {
          index: "users",
          type: "user", 
          email: req.payload.email
        }
      },
      config: {
        auth: 'basic',
        tags: ['api', 'login'],
        description: 'Login an User'
      }
    }

    ]
}();
