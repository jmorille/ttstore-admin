"use strict";


function TaskDAO() {};

TaskDAO.prototype = (function () {

  return {
    findByID: function findByID(request, callback) {
      var es =  request.server.plugins['elasticsearch-hapi-plugin'];
      var opt = {
        body: {
          query: {
            "bool": {
              "should": [{term: {userId: request.userId}}, {term: {taskId: request.taskId}}]
            }
          }
        }
      };
      es.search(opt, callback);
    },
    find: function find(request, callback) {
      var es =  request.server.plugins['elasticsearch-hapi-plugin'];
      var opt = {
        body: {query: {term: {userId: request.userId}}}
      };
      es.search(opt, callback);
    },
    insert: function insert(request, callback) {
      var es =  request.server.plugins['elasticsearch-hapi-plugin'];
      var values = [
        request.userId,
        request.description
      ];

      var sql = "insert into task " +
        " (userId, description)" +
        " values (?,?)";

      es.create({
        sql: sql,
        values: values,
        callback: callback
      });
    },
    update: function update(params, callback) {

      var values = [
        params.description,
        params.userId,
        params.taskId
      ];

      var sql = "update task " +
        " set description = ? " +
        " where userId = ? " +
        " and taskId = ? ";

      es.query({
        sql: sql,
        values: values,
        callback: callback
      });
    },
    delete: function (params, callback) {

      var values = [
        params.taskId,
        params.userId
      ];

      var sql = "delete from task" +
        " where taskId = ?" +
        " and userId = ?";

      es.query({
        sql: sql,
        values: values,
        callback: callback
      });
    },
  };
})();

var taskDAO = new TaskDAO();
module.exports = taskDAO;
