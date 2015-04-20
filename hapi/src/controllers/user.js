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
    findByID: function findByID(request, callback) {
      var entityId = request.params.id;
      var opt = registerIndex({
        id: entityId
      });
      var es = request.server.plugins['hapi-es'].client;
      es.get(opt, callback);
    },
    search: function find(request, callback) {
      var opt = registerIndex(request.payload);
   //   var es = request.server.plugins['hapi-es'].client;
     // es.search(opt, callback);
      request.server.methods.essearch(opt, function (err, res) {
        callback(err, res);
      });
    },
    create: function insert(request, callback) {
      var opt = registerIndex(request.body, true);
      var es = request.server.plugins['hapi-es'].client;
      es.create(opt, callback);
    },
    update: function update(request, callback) {
      // Compplete the request
      var entityId = request.params.id;
      var opt = registerIndex(request.payload, true);
      opt.id = entityId;
      // Validation
      // Validation
      if (!opt.version) {
//        Boom.preconditionFailed( 'Document Version is required for update', [data]);
      }

   //   var es = request.server.plugins['hapi-es'].client;
   //   es.update(opt, callback);
      request.server.methods.esupdate(opt, function (err, res) {
        callback(err, res);
      });

    },
    delete: function (params, callback) {
      var entityId = request.params.id;
      var opt = registerIndex(request.payload, true);
      opt.id = entityId;

      var es = request.server.plugins['hapi-es'].client;
      es.delete(opt, callback);


    },
  };
})();

var taskDAO = new UserDAO();
module.exports = taskDAO;
