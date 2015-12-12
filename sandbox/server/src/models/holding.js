'use strict';

/**
 * Module dependencies.
 */

var url = require('url');
var http = require('http');

var esapi = require('./crud-es');

function registerIndex(payload) {
  payload.index = 'holding';
  if (!payload.type) {
    payload.type = 'holding';
  }
  payload._sourceExclude = ['secured'];
  return payload;
}


function users(app, client) {
  console.log('Module model Holding ');
  if (!app) {
    throw new TypeError('app required');
  }
  if (!client) {
    throw new TypeError('client required');
  }

  var crudapi = esapi(client, registerIndex);
  var index = 'users';


  app.post('/s/' + index + '/_search', crudapi.search);
  app.get('/s/' + index + '/:id', crudapi.findById);
  app.post('/s/' + index + '/', crudapi.create);
  app.post('/s/' + index + '/new', crudapi.create);
  app.put('/s/' + index + '/:id', crudapi.update);
  app.delete('/s/' + index + '/:id', crudapi.delete);

}


module.exports = users;

