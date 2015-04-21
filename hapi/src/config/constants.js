"use strict";
var pack = require('../../package');

module.exports = function () {

  var env = process.env.NODE_ENV || 'production';
  var appConstants = applicationConfig();

  var obj = {
    app: {
      url: appConstants[env]['url'],
      host: appConstants[env]['host'],
      port: appConstants[env]['port'],
      jwtSecret :  appConstants[env]['jwtSecret']
    },
    es:  elasticsearchConfig()[env],
    swagger: swaggerConfig()[env],
    tv: tvConfig()[env],
    server: {
      defaultHost: 'http://localhost:8001'
    }
  };

  return obj;

  function elasticsearchConfig() {
    var host =  process.env.ES_ADDR || 'es';
    var port =  process.env.ES_PORT || '9200';
    var protocol = process.env.ES_PROTOCOL || 'http';
    var esHost = protocol+'://' + host+ ':' + port;
    return {
      'production': {
        'host': esHost
      }
    };
  }

  function applicationConfig() {
    return {
      'production': {
        'port': parseInt(process.env.PORT, 10) || 8000,
        'jwtSecret':  process.env.JWT_SECRET || 'ejaojeaomlelujua46z485eaz4!!aza'
      }
    };
  }

  function swaggerConfig() {
    // https://github.com/glennjones/hapi-swagger
    return {
      'production': {
        apiVersion: pack.version,
        documentationPath: '/documentation',
        endpoint: '/docs',
        enableDocumentationPage: true
      }
    }
  }

  function tvConfig() {
    // https://github.com/glennjones/hapi-swagger
    return {
      'production': {
        endpoint: '/debug/console',
        authenticateEndpoint: false
      }
    }
  }

}();
