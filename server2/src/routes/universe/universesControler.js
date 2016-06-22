'use strict';
const Hoek = require('hoek'); // hapi utilities https://github.com/hapijs/hoek


var internals = {};



class UniversesControler {
  constructor(es) {
    this.es = es;
  }

  findAll(request, reply) {
    reply('searchAll (');
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
