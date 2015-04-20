'use strict';


var userController = require('./../controllers/user');
//var taskValidate = require('./../validate/task');

module.exports = function (plugin, options, next) {
  //var es = plugin['elasticsearch-hapi-plugin'].es;
  console.log('userController initialisation');
  return [
    {
      method: 'GET',
      path: '/s/users/{id}',
      handler: userController.findByID
    },
    {
      method: 'POST',
      path: '/s/users/_search',
      handler: userController.search
    },
    {
      method: 'POST',
      path: '/s/users/new',
      handler: userController.create
    },
    {
      method: 'PUT',
      path: '/s/users/{id}',
      handler: userController.update
    },
    {
      method: 'DELETE',
      path: '/s/users/{id}',
      handler: userController.delete
    }
  ];
}();
