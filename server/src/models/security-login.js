'use strict';

// http://blog.matoski.com/articles/jwt-express-node-mongoose/#user
var jwt = require('jsonwebtoken');
var path = require('path'),
  _ = require("lodash");

//  UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js"));

function registerIndex(payload) {
  payload.index = 'userlogin';
  if (!payload.type) {
    payload.type = 'userlogin';
  }
  payload._sourceExclude = ['secured'];
  return payload;
}


function securityLogin(app, client) {
  console.log('Module model Security Login');
  if (!app) {
    throw new TypeError('app required');
  }
  if (!client) {
    throw new TypeError('client required');
  }

  app.post('/api/login', authenticate);
  app.get('/api/verify', verify);
  app.use('/api/signup', signup);

}


function authenticate(req, res, next) {
//Client will call this method to query a token
  var username = req.body.username,
    password = req.body.password;
  console.log('authenticate request for ', username, ' / ', password);
  // Surface Control
  if (_.isEmpty(username) || _.isEmpty(password)) {
    return next();
    //return next(new UnauthorizedAccessError("401", {message: 'Invalid username or password'}));
  }
  // Search User
  // Compare password

  if (true) {
    //properties contained in the token, of course you can add first name, last name and so on
    var profile = {
      username: username
    };
    // We are encoding the profile inside the token
    var token = jwt.sign(profile, req.app.get('secret'), {
      expiresInMinutes: 60 * 5
    });
    res.json({
      token: token
    });

    return res.status(200).json(req.user);
  }
}

function fetchHeaderAuth(headers) {
  if (headers && headers.authorization) {
    var authorization = headers.authorization;
    var part = authorization.split(' ');
    if (part.length === 2) {
      var token = part[1];
      return token;
    } else {
      return null;
    }
  } else {
    return null;
  }
};


function verify(req, res, next) {
  var token = fetchHeaderAuth(req.headers);
  var secret = req.app.get('secret');
  jwt.verify(token, secret, function (err, decode) {
    if (err) {
      req.user = undefined;
     // return next(new UnauthorizedAccessError("invalid_token"));
      return next();
    }
    console.log('jwt decode', decode);
    return res.status(200).json(undefined);
  });

}

function signup(req, res) {
  //when signup method is called, we insert a new user in couchDB, username being the id of the record
  var opt = registerIndex({
    'login': req.body.username,
    'password': req.body.password
  });
  client.create(opt, function (err, resp, status) {
    if (err) {
      console.error('Elasticsearch Error', err);
      if (status) {
        response.status(status);
      } else {
        response.status(400);
      }
      response.send(err);
      return;
    }
    var profile = {
      username: req.body.username
    };
    // We are encoding the profile inside the token
    var token = jwt.sign(profile, req.app.get('secret'), {
      expiresInMinutes: 60 * 5
    });
    res.json({
      token: token
    });


  });

}

module.exports = securityLogin;
