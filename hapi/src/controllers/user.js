'use strict';
var hoek = require('hoek'); // hapi utilities https://github.com/hapijs/hoek
var Boom = require('boom'); // error handling https://github.com/hapijs/boom


var registerIndex = function (payload, refresh) {
  payload.index = 'users';
  if (!payload.type) {
    payload.type = 'user';
  }
  payload._sourceExclude = ['secured'];
  //
  payload.preference = '_primary';
  if (refresh) {
    payload.refresh = true;
  }
  return payload;
};


function UserDAO() {
};

UserDAO.prototype = (function () {

  return {
    findByID: function get(request, callback) {
      var entityId = request.params.id;
      var opt = registerIndex({
        id: entityId
      });
      request.server.methods.es.get(opt, function (err, res) {
        callback(err, res);
      });
    },
    search: function search(request, reply) {
      var opt = registerIndex(request.payload);
      request.server.methods.es.search(opt, function (err, res) {
        reply(err, res);
      });
    },
    create: function create(request, reply) {
      var opt = registerIndex(request.body, true);
      request.server.methods.es.create(opt, function (err, res) {
        reply(err, res);
      });

    },
    update: function update(request, reply) {
      // Compplete the request
      var entityId = request.params.id;
      var opt = registerIndex(request.payload, true);
      opt.id = entityId;
      // Validation
      // Validation
      if (!opt.version) {
//        Boom.preconditionFailed( 'Document Version is required for update', [data]);
      }
      request.server.methods.es.update(opt, function (err, res) {
        reply(err, res);
      });

    },
    delete: function (params, callback) {
      var entityId = request.params.id;
      var opt = registerIndex(request.payload, true);
      opt.id = entityId;
      request.server.methods.es.delete(opt, function (err, res) {
        callback(err, res);
      });

    },
  };
})();

var taskDAO = new UserDAO();
module.exports = taskDAO;
