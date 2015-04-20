var Hapi = require('hapi');
var Good = require('good');

var routes = require('./routes');
var constants = require('./config/constants.js');

// Config
var port = constants.application['port'];

// Http Server
var server = new Hapi.Server();
server.connection({port: port});

// Views
var defaultContext = {
  title: 'My personal site'
};

server.views({
  engines: {
    'html': {
      module: require('handlebars'),
      compileMode: 'sync' // engine specific
    }
  },
  context: defaultContext
});


// Add all the routes within the routes folder
for (var route in routes) {
  console.log("Register Routes ", routes[route]);
  server.route(routes[route]);
}

server.route({
  method: 'GET',
  path: '/hello',
  handler: function (request, reply) {
    console.log("Hello World -- in console");
    reply('world');
  }
});

server.route({
  method: 'GET',
  path: '/hello/{user}',
  handler: function (request, reply) {
    var user = request.params.user ? encodeURIComponent(request.params.user) : 'stranger';
    console.log('----------------- Hello',  user);
    reply('Hello ' +user + '!'); //.type('application/json');
  },
  config: {
    description: 'Say hello!',
    notes: 'The user parameter defaults to \'stranger\' if unspecified',
    tags: ['api', 'greeting']
  }
});

server.route({
  method: 'GET'
  , path: '/'
  , handler: function(req, reply) {
    reply('i am a beautiful butterfly');
  }
});

var plugins = [
  {
    register: require('./plugins/hapi-es'),
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

//server.start();
