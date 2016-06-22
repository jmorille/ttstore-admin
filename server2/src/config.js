var Confidence = require("confidence");
var CryptoJS = require("crypto-js");

var internals = {};
var config = {};


config.app = {
  $filter: 'env',
  production: { // this is the default configuration if no env.ENVIRONMENT variable is set.
    port: parseInt(process.env.PORT, 10) || 8000,

  },
  $default: { // this is the default configuration if no env.ENVIRONMENT variable is set.
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
      aud: '574477482111-6gok0tbgrhfj50bhrhsk0mab0hdp81dr.apps.googleusercontent.com',
      password: 'hapiauth',
      clientId: '574477482111-6gok0tbgrhfj50bhrhsk0mab0hdp81dr.apps.googleusercontent.com', // fill in your Google ClientId here
      clientSecret: 'RYKvON95oFD-dHSjprRhV5eJ', // fill in your Google Client Secret here
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
      aud: '574477482111-6gok0tbgrhfj50bhrhsk0mab0hdp81dr.apps.googleusercontent.com',
      clientId: '574477482111-6gok0tbgrhfj50bhrhsk0mab0hdp81dr.apps.googleusercontent.com', // fill in your Google ClientId here
      clientSecret: 'RYKvON95oFD-dHSjprRhV5eJ' // fill in your Google Client Secret here
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
  $default: { // this is the default configuration if no env.ENVIRONMENT variable is set.
    endpoint: '/debug/console',
    authenticateEndpoint: false
  }
};

config.authorization = {
  $filter: 'env',
  production: {
    roles: false
  },
  $default: { // this is the default configuration if no env.ENVIRONMENT variable is set.
    roles: false
  }
};


var store = new Confidence.Store(config);

var criteria = {
  env: process.env.NODE_ENV
};

exports.get = function (key) {
  return store.get(key, criteria);
};
