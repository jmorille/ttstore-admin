"use strict";

module.exports = function () {

  var env = process.env.NODE_ENV || 'production';
  var dbContants = elasticsearchConfig();
  var appConstants = applicationConfig();

  var obj = {
    application: {
      url: appConstants[env]['url'],
      host: appConstants[env]['host'],
      port: appConstants[env]['port'],
    },
    es: {
      host: dbContants[env]['host'],
      port: dbContants[env]['port'],
    },
    server: {
      defaultHost: 'http://localhost:8001'
    }
  };

  return obj;

  function elasticsearchConfig() {
    return {
      'production': {
        'host': process.env.ES_ADDR || 'es',
        'port': process.env.ES_PORT || '9200'
      }
    };
  }

  function applicationConfig() {
    return {
      'production': {
        'port': parseInt(process.env.PORT, 10) || 8000
      }
    };
  }
}();
