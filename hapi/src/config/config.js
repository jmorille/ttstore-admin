var Confidence = require("confidence");
var CryptoJS = require("crypto-js");

var config = {};
var internals = {};

config.provider = {
  $filter: 'env',
  production: {
    google: {
      provider: 'google',
      password: 'hapiauth',
      clientId: '', // fill in your Google ClientId here
      clientSecret: '', // fill in your Google Client Secret here
      isSecure: false // Terrible idea but required if not using HTTPS
    }
  },
  $default: { // this is the default configuration if no env.ENVIRONMENT varaible is set.
    jwt: {
      jwtSecret: process.env.JWT_SECRET || 'ejaojeaomlelujua46z485eaz4!!aza'
    },
    google: {
      provider: 'google',
      password: 'hapiauth',
      clientId: '', // fill in your Google ClientId here
      clientSecret: '', // fill in your Google Client Secret here
      isSecure: false // Terrible idea but required if not using HTTPS
    },
  }
};

config.elastic = {
  $filter: 'env',
  production: {
    client: {
      host: 'http://es:9200'
    }
  },
  $default: { // this is the default configuration if no env.ENVIRONMENT varaible is set.
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

config.jwt = {
  $filter: 'env',
  production: {
    'jwtSecret': process.env.JWT_SECRET || 'ejaojeaomlelujua46z485eaz4!!aza'

  },
  $default: { // this is the default configuration if no env.ENVIRONMENT varaible is set.
    'jwtSecret': process.env.JWT_SECRET || 'ejaojeaomlelujua46z485eaz4!!aza'
  }
};

var store = new Confidence.Store(config);

var criteria = {
  env: process.env.NODE_ENV
};

exports.get = function (key) {
  return store.get(key, criteria);
};
