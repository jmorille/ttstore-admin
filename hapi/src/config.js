var Confidence = require("confidence");
var CryptoJS = require("crypto-js");

var internals = {};
var config = {};


config.app = {
  $filter: 'env',
  production: { // this is the default configuration if no env.ENVIRONMENT varaible is set.
    port: parseInt(process.env.PORT, 10) || 8000,

  },
  $default: { // this is the default configuration if no env.ENVIRONMENT varaible is set.
    port: parseInt(process.env.PORT, 10) || 8000,
    console: {
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log: ['error', 'info', 'debug']
        }
      }]
    }
  }
};

config.provider = {
  $filter: 'env',
  production: {
    google: {
      provider: 'google',
      password: 'hapiauth',
      clientId: '584480502162-tujkhqf3lfr3adqidnnr5g7qnqshodqg.apps.googleusercontent.com', // fill in your Google ClientId here
      clientSecret: '4hIB8jVeAm4xBnm2ocNca0gF', // fill in your Google Client Secret here
      isSecure: false // Terrible idea but required if not using HTTPS
    }
  },
  $default: { // this is the default configuration if no env.ENVIRONMENT varaible is set.
    jwt: {
      'expTime' :  (  7 * 24 * 60 * 60 * 1000 ),// + 1 week (JS timestamp is ms...)
      jwtSecret: process.env.JWT_SECRET || 'ejaojeaomlelujua46z485eaz4!!aza'
    },
    google: {
      provider: 'google',
      clientId: '584480502162-tujkhqf3lfr3adqidnnr5g7qnqshodqg.apps.googleusercontent.com', // fill in your Google ClientId here
      clientSecret: '4hIB8jVeAm4xBnm2ocNca0gF', // fill in your Google Client Secret here
      redirectUrl: undefined  // fill in your Google redirect URL
    }
  }
};

config.elastic = {
  $filter: 'env',
  production: {
    client: {
      host: 'http://es:9200'
    }
  },
  home: {
    client: {
      host: 'http://192.168.1.100:9200'
    }
  },
  $default: { // this is the default configuration if no env.ENVIRONMENT variable is set.
    client: {
      host: 'http://localhost:9200'
    }
  }
};

config.tv = {
  $filter: 'env',
  production: {
    endpoint: '/debug/console',
    authenticateEndpoint: false
  },
  $default: { // this is the default configuration if no env.ENVIRONMENT varaible is set.
    endpoint: '/debug/console',
    authenticateEndpoint: false
  }
};



var store = new Confidence.Store(config);

var criteria = {
  env: process.env.NODE_ENV
};

exports.get = function (key) {
  return store.get(key, criteria);
};
