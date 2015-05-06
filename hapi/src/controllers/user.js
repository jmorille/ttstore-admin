'use strict';
var Hoek = require('hoek'); // hapi utilities https://github.com/hapijs/hoek
var Boom = require('boom'); // error handling https://github.com/hapijs/boom
var Bcrypt = require('bcrypt');

var internals = {};

internals.table = {
  index: 'users',
  type: 'user'
};

internals.registerIndexTable = function (payload) {
  payload.index = internals.table.index;
  if (!payload.type) {
    payload.type = internals.table.type;
  }
  return payload;
};

// OpenBSD's Blowfish password hashing code, as described in "A Future-Adaptable Password Scheme" by Niels Provos and David Mazières.
// http://www.openbsd.org/papers/bcrypt-paper.ps
// http://www.mindrot.org/projects/jBCrypt/
internals.passwordEncode = function (password, callback) {
  // gensalt's log_rounds parameter determines the complexity
// the work factor is 2**log_rounds, and the default is 10
  Bcrypt.genSalt(12, function (err, salt) { //encrypt the password
    Bcrypt.hash(password, salt, function (err, hash) {
      callback(err, hash);
    });
  });
};

internals.passwordVerify = function (passwordClear, passwordEncoded, callback) {
  Bcrypt.compare(passwordClear, passwordEncoded, function (err, isValid) {
    callback(err, isValid);
  });
};


var registerIndex = function (payload, refresh) {
  payload = internals.registerIndexTable(payload);
  payload._sourceExclude = ['secured'];
  //
  payload.preference = '_primary';
  if (refresh) {
    payload.refresh = true;
  }
  return payload;
};

var UserDAO = function () {
};

UserDAO.prototype.findByID = function get(request, callback) {
  var entityId = request.params.id;
  var opt = registerIndex({
    id: entityId
  });
  request.server.methods.es.get(opt, function (err, res) {
    callback(err, res);
  });
};


UserDAO.prototype.search = function search(request, reply) {
  var opt = registerIndex(request.payload);
  request.server.methods.es.search(opt, function (err, res) {
    reply(err, res);
  });
};


UserDAO.prototype.create = function create(request, reply) {
  var opt = registerIndex(request.body, true);
  request.server.methods.es.create(opt, function (err, res) {
    reply(err, res);
  });
};


UserDAO.prototype.update = function update(request, reply) {
  // Compplete the request
  var entityId = request.params.id;
  var opt = registerIndex(request.payload, true);
  opt.id = entityId;
  // Validation
  // Validation
  if (!opt.version) {
//        Boom.preconditionFailed( 'Document Version is required for update', [data]);
  }
  request.server.methods.es.update(opt, function (err, res) {
    reply(err, res);
  });
};


UserDAO.prototype.delete = function (params, callback) {
  var entityId = request.params.id;
  var opt = registerIndex(request.payload, true);
  opt.id = entityId;
  request.server.methods.es.delete(opt, function (err, res) {
    callback(err, res);
  });
};

UserDAO.prototype.verifyPasswordById = function (request, password, callback) {
  var entityId = request.params.id;
  var opt = Hoek.applyToDefaults(internals.table, {
    id: entityId,
    _sourceInclude: 'secured'
  });
  request.server.methods.es.get(opt, function (err, res) {
    if (res.found) {
      internals.passwordVerify(password, res._source.secured.password, callback);
    } else {
      // Replace erru with not found

      callback(err, false);
    }
  });
};

UserDAO.prototype.verifyByEmail = function (request, email, callback) {
  var opt = Hoek.applyToDefaults(internals.table, {
    body: {
      query: {
        term: {email: email}
      }
    },
    _sourceInclude: ['email', 'verified_email' ]
  });
  request.server.methods.es.search(opt, function (err, res) {
    if (err || !res) {
      return callback(err, false);
    }
    var result = res.hits;
    if (result.total === 1) {
      var user = result.hits[0];
      //console.log('** Find ONE verifyPasswordByEmail : --- ', err, JSON.stringify(res));
      return callback(err, true, user);
    } else if (result.total > 1) {
      // TODO manage Multiple email
      //request.server.log(['es', 'login', 'error', 'validation'], '** Find MULTIPLE user for verifyPasswordByEmail : --- ', JSON.stringify(opt));
      //request.server.log(['es', 'login', 'error', 'validation'], '** Find MULTIPLE user for verifyPasswordByEmail : --- ', JSON.stringify(res));
      //console.log('** Find MULTIPLE user for verifyPasswordByEmail : --- ', JSON.stringify(opt));
      //console.log('** Find MULTIPLE user for verifyPasswordByEmail : --- ', JSON.stringify(res));
      return callback(err, false);
    } else {
      console.log('** Find OTHER verifyPasswordByEmail : --- ', err, JSON.stringify(res));
      return callback(err, false);
    }

  });

};

UserDAO.prototype.verifyPasswordByEmail = function (request, email, password, callback) {
  var opt = Hoek.applyToDefaults(internals.table, {
    body: {
      query: {
        term: {email: email}
      }
    },
    _sourceInclude: ['email', 'verified_email' , 'secured.password']
  });
  console.log('verifyPasswordByEmail', opt);
  request.server.methods.es.search(opt, function (err, res) {
    if (err || !res) {
      return callback(err, false);
    }
    var result = res.hits;
    if (result.total === 1) {
      var user = result.hits[0];
      //console.log('** Find ONE verifyPasswordByEmail : --- ', err, JSON.stringify(res));
      internals.passwordVerify(password, user._source.secured.password, function (err, isValid) {
        delete user.secured;
        return callback(err, isValid, user);
      });
    } else if (result.total > 1) {
      // TODO manage Multiple email
      //request.server.log(['es', 'login', 'error', 'validation'], '** Find MULTIPLE user for verifyPasswordByEmail : --- ', JSON.stringify(opt));
      //request.server.log(['es', 'login', 'error', 'validation'], '** Find MULTIPLE user for verifyPasswordByEmail : --- ', JSON.stringify(res));
      //console.log('** Find MULTIPLE user for verifyPasswordByEmail : --- ', JSON.stringify(opt));
      //console.log('** Find MULTIPLE user for verifyPasswordByEmail : --- ', JSON.stringify(res));
      return callback(err, false);
    } else {
      console.log('** Find OTHER verifyPasswordByEmail : --- ', err, JSON.stringify(res));
      return callback(err, false);
    }

  });
};

UserDAO.prototype.updatePasswordById = function (request, reply) {
  var entityId = request.params.userId;
  var password = request.payload.password;
  internals.passwordEncode(password, function (err, hash) {
    //console.log('password', password, ' = ', hash);
    var opt = Hoek.applyToDefaults(internals.table, {
      id: entityId,
      body: {
        doc: {
          secured: {password: hash}
        }
      }
    });
    request.server.methods.es.update(opt, function (err, res) {
      reply(err, res);
    });
  });
};


var userDAO = new UserDAO();
module.exports = userDAO;
