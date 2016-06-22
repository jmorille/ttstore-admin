'use strict';

const Joi = require('joi');


var crudApiRoutes = function(entityName, entityControler, server, options) {
  return [
    {
      method: 'POST',
      path: '/s/' + entityName  ,
      handler: entityControler.create,
      config: {
        tags: ['api', entityName],
        description: 'Create '+entityName +' by Id',
        validate: {
          headers: Joi.object({'authorization': Joi.string().required()}).unknown()
        }
      }
    },
    {
      method: 'GET',
      path: '/s/' + entityName  ,
      handler: entityControler.findAll,
      config: {
        tags: ['api', entityName],
        description: 'Get all '+entityName ,
        validate: {
        }
      }
    },
    {
      method: 'GET',
      path: '/s/' + entityName + '/{id}',
      handler: entityControler.getByID,
      config: {
        tags: ['api', entityName],
        description: 'Get '+entityName +' by Id',
        validate: {
          params: {
            id: Joi.string().required() .description('the unique identifier of this resource')
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/s/' + entityName + '/{id}',
      handler: entityControler.deleteById,
      config: {
        tags: ['api', entityName],
        description: 'Delete '+entityName +' by Id',
        validate: {
          params: {
            id: Joi.string().required() .description('the unique identifier of this resource')
          },
          headers: Joi.object({'authorization': Joi.string().required()}).unknown()
        }
      }
    },
    {
      method: 'PUT',
      path: '/s/' + entityName + '/{id}',
      handler: entityControler.updateByID,
      config: {
        tags: ['api', entityName],
        description: 'Update '+entityName +' by Id',
        validate: {
          params: {
            id: Joi.string().required() .description('the unique identifier of this resource')
          },
          headers: Joi.object({'authorization': Joi.string().required()}).unknown()
        }
      }
    }

  ];
};

class UniversesControler {
  constructor(es) {
    this.es = es;
  }

  findAll(request, reply) {
    reply('findAll (');
  }

  getByID(request, reply) {
    var entityId = request.params.id;
    reply('getByID (' + entityId);
  }

  updateByID(request, reply) {
    reply('findByID ('  + entityId);
  }

  deleteById(request, reply) {
    reply('deleteById (' + entityId);
  }

  create(request, reply) {
    reply('create (');
  }

}

// Options can be passed to plugins on registration
exports.register = function(server, options, next) {
  let controler = new UniversesControler();
  let routes = crudApiRoutes('universes', controler);
  server.route(routes);

  // Callback, completes the registration process
  next();
}

// Required for all plugins
// If this were a npm module, one could do this:
// exports.register.attributes = require('package.json')
exports.register.attributes = {
  name: 'universe-route', // Must be unique
  version: '1.0.0'
};
