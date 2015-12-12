// http://blog.matoski.com/articles/jwt-express-node-mongoose/#user
var debug = require('debug')('security:login:' + process.pid);
var jwt = require('jsonwebtoken');
var path = require('path'),
  _ = require('lodash'),
  UnauthorizedAccessError = require('../errors/UnauthorizedAccessError');


var client = undefined;


function registerIndex(payload) {
  payload.index = 'userlogin';
  if (!payload.type) {
    payload.type = 'userlogin';
  }
  //payload._sourceExclude = ['secured'];
  return payload;
}


function securityLogin(app, clientEs) {
  console.log('Module model Security Login', client);
  if (!app) {
    throw new TypeError('app required');
  }
  if (!clientEs) {
    throw new TypeError('client required');
  }

  client = clientEs;

  app.post('/api/signup', signup);
  app.post('/api/login', authenticate);
  app.get('/api/logout', logout);
  app.get('/api/verify', verify);

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
}

function comparePassword(passwdCandidate, passwdRef, cb) {
  cb(null, passwdRef === passwdCandidate);
}


function logout(req, res, next) {
  delete req.user;
  return res.status(200).json({
    'message': 'User has been successfully logged out'
  });
}
function signup(req, res, next) {
  //when signup method is called, we insert a new user in couchDB, username being the id of the record
  var opt = registerIndex({
    body: {
      'login': req.body.username,
      secured: {
        'password': req.body.password
      }
    }
  });
  console.log('Request sigin in', opt);
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


function getOneUser(optSearchUser, done) {
  client.search(optSearchUser, function (error, response) {
    // Error Management
    if (error) {
      console.log('Client error ', error);
      return done(error);
    } else if (response.hits.total === 0) {
      return done(new UnauthorizedAccessError('401', {message: 'Invalid username or password'}));
    } else if (response.hits.total > 1) {
      return done(new UnauthorizedAccessError('401', {message: 'Invalid username or password'}));
    }
    // User Management
    var user = response.hits.hits[0];
    done(null, user);
  });
}


function verify(req, res, next) {
  console.log('Verifying token');
  var token = fetchHeaderAuth(req.headers);
  var secret = req.app.get('secret');
  jwt.verify(token, secret, function (err, decode) {
    if (err) {
      req.user = undefined;
      return next(new UnauthorizedAccessError('invalid_token'));
    }
    console.log('token deploy', decode);
    var username = decode.username;
    next();
    var optSearchUser = registerIndex({body: {query: {term: {login: username}}}});
    getOneUser(optSearchUser, function (err, user) {
      if (err) {
        return next(err);
      }
      // check password
      req.user = user;
      res.status(200);
      res.json( undefined );
    });
  });
}


function authenticate(req, res, next) {
  //Client will call this method to query a token
  var username = req.body.username,
    password = req.body.password;
  // Surface Control
  if (_.isEmpty(username) || _.isEmpty(password)) {
    return next(new UnauthorizedAccessError('401', {message: 'Invalid username or password'}));
  }
  // Search User
  var optSearchUser = registerIndex({body: {query: {term: {login: username}}}});
  getOneUser(optSearchUser, function (err, user) {
    if (err) {
      return next(err);
    }
    console.log('Find User ', user);
    // Compare password
    comparePassword(password, user._source.secured.password, function (err, isMatch) {
      if (isMatch && !err) {
        console.log('Password User match', user);
        req.user = user;
        // Json Web Token
        var profile = {
          username: username
        };
        var token = jwt.sign(profile, req.app.get('secret'), {
          expiresInMinutes: 60 * 5
        });
        res.json({token: token});
        console.log('authenticate token', token);
      } else {
        return next(new UnauthorizedAccessError("401", {  message: 'Invalid username or password' }));
      }
    });
  });
}


module.exports = securityLogin;
