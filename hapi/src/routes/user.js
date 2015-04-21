'use strict';

var Joi = require('joi');
var userController = require('./../controllers/user');
//var taskValidate = require('./../validate/task');

module.exports = function (plugin, options, next) {
  console.log('userController initialisation');
  return [
    {
      method: 'GET',
      path: '/s/users/{id}',
      handler: userController.findByID,
      config: {
        tags: ['api', 'users'],
        description: 'Get User by Id',
        validate: {
          params: {
            id: Joi.string().required() .description('the unique identifier of this resource')
          },
          headers: Joi.object({'authorization': Joi.string().required()}).unknown()
        }
      }

    },
    {
      method: 'POST',
      path: '/s/users/_search',
      handler: userController.search,
      config: {
        tags: ['api', 'users'],
        description: 'Search User',
        notes: ['Use the Elasticsearch payload query']
      }
    },
    {
      method: 'POST',
      path: '/s/users/new',
      handler: userController.create,
      config: {
        tags: ['api', 'users'],
        description: 'Create a new User'
      }
    },
    {
      method: 'PUT',
      path: '/s/users/{id}',
      handler: userController.update,
      config: {
        tags: ['api'],
        description: 'Update User by Id',
        validate: {
          params: {
            id: Joi.string().required()
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/s/users/{id}',
      handler: userController.delete,
      config: {
        tags: ['api'],
        description: 'Delete User by Id',
        validate: {
          params: {
            id: Joi.string().required()
          }
        }
      }
    }
  ];

}();
