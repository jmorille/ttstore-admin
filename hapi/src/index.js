var Hapi = require('hapi');
var Good = require('good');

var routes = require('routes');
var constants = require('config/constants.js');


var port = constants.application['port'];
var server = new Hapi.Server();
server.connection({port: port});


// Add all the routes within the routes folder
for (var route in routes) {
  server.route(routes[route]);
}


var plugins = [
  {
    plugin: require('elasticsearch-hapi-plugin'),
    options: {
      host: 'http://' + constants.es['host'] + ':' + constants.es['port']
    }
  },
  {
    register: Good,
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log: '*'
        }
      }]
    }
  }
];


server.register(plugins, function (err) {
  if (err) {
    console.log('error when registering modules', error);
    throw err; // something bad happened loading the plugin
  }

  server.start(function (err) {
    if (err) {
      console.log('error when starting server', error);
    }
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});

