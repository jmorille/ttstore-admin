"use strict";



module.exports = function (plugin, options, next) {
  //var es = plugin['elasticsearch-hapi-plugin'].es;
  console.log('taskController initialisation');
  return [
    {
      method: 'GET',
      path: '/',
      config: { auth: 'simple' },
      handler: function (request, reply) { reply("Home!");}
    }

  ];
}();
