'use strict';

var Bcrypt = require('bcrypt');
var aguid  = require('aguid'); // https://github.com/ideaq/aguid
var userController = require('./../controllers/user');

module.exports = function validate (request, email, password, callback) {
//  console.log('Basic Auth : --- ',request!=null);
  console.log('Basic Auth : --- ', email, password);
  userController.verifyPasswordByEmail(request, email, password, function (err, isValid) {
    callback(err, isValid, { id: res._id, email: res._source.email });
  });
  var record =  {
    index: "users",
    type: "user",
    id: aguid(email)
  }
  request.server.methods.es.get(record, function (err, res) {
    server.log(['info'], 'Es search for login', res);
    if(res.found) { // compare to bcrypt hash on file
      Bcrypt.compare(password, res._source.secured.password, function (err, isValid) {
        callback(err, isValid, { id: res._id, email: res._source.email });
      });
    } else {
      callback(null, false); // person has not registered
    }
  });
};
