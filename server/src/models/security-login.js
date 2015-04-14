// http://blog.matoski.com/articles/jwt-express-node-mongoose/#user
var debug = require('debug')('security:login:' + process.pid);
var jwt = require('jsonwebtoken');
var path = require('path'),
  _ = require('lodash'),
  UnauthorizedAccessError = require('../errors/UnauthorizedAccessError');

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
  var logApi = loginApi(client);
  app.post('/api/signup', logApi.signup);
  app.post('/api/login', logApi.authenticate);
  app.get('/api/logout', logApi.logout);
  app.get('/api/verify', logApi.verify);

}

function loginApi(client) {
  return {

    fetchHeaderAuth: function (headers) {
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
    },
    logout: function (req, res, next) {
      delete req.user;
      return res.status(200).json({
        'message': 'User has been successfully logged out'
      });
    },
    signup: function (req, res, next) {
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
    },
    verify: function (req, res, next) {
      debug("Verifying token");
      var token = fetchHeaderAuth(req.headers);
      var secret = req.app.get('secret');
      jwt.verify(token, secret, function (err, decode) {
        if (err) {
          req.user = undefined;
          return next(new UnauthorizedAccessError("invalid_token"));
        }
        console.log('token deploy', decode);
        debug(decode);
        next();
        //exports.retrieve(token, function (err, data) {
        //  if (err) {
        //    req.user = undefined;
        //    return next(new UnauthorizedAccessError("invalid_token", data));
        //  }
        //  req.user = data;
        //  next();
        //});

      });
    },


    authenticate: function (req, res, next) {
//Client will call this method to query a token
      var username = req.body.username,
        password = req.body.password;
      // Surface Control
      if (_.isEmpty(username) || _.isEmpty(password)) {
        return next(new UnauthorizedAccessError("401", {message: 'Invalid username or password'}));
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
      }
      debug('authenticate', token);
      console.log('authenticate token', token);

    },



  }
}


module.exports = securityLogin;
