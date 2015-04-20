"use strict";


var taskController = require('./../controllers/task');
//var taskValidate = require('./../validate/task');

module.exports = function(plugin, options, next) {
  //var es = plugin['elasticsearch-hapi-plugin'].es;
  console.log('taskController initialisation');
  return [
    {
      method: 'GET',
      path: '/tasks/{task_id}',
      config : {
        handler: taskController.findByID
      }
    },
    {
      method: 'GET',
      path: '/tasks',
      config : {
        handler: taskController.find
      }
    },
    {
      method: 'POST',
      path: '/tasks',
      config : {
        handler : taskController.insert
      }
    },
    {
      method: 'PUT',
      path: '/tasks/{task_id}',
      config : {
        handler: taskController.update
      }
    },
    {
      method: 'DELETE',
      path: '/tasks/{task_id}',
      config : {
        handler: taskController.delete
      }
    }
  ];
}();
