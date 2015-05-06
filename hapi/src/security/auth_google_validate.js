'use strict';

var Boom = require('boom');
var Hoek = require('hoek');

var userController = require('./../controllers/user');

module.exports = function validate (request, tokeninfo, callback) {
//  console.log('Basic Auth : --- ',request!=null);
//  console.log('Basic Auth : --- ', email, password);
  var email = tokeninfo.email;
  var verifiedEmail = tokeninfo.verified_email;

  userController.verifyByEmail(request, email, function (err, isValid, res) {
    //console.log('Basic Auth : --- ', email, password, ' is Valid', isValid, ' ==>', res);
    //console.log('Basic Auth : --- Error  ', err);
    if (isValid) {
      var googleToken =    Hoek.clone(tokeninfo);
      callback(err, isValid, { userId: res._id, email: res._source.email, verified_email: res._source.verified_email|| false,  google_tokeninfo : tokeninfo });
    } else {
      callback(err, isValid );
    }
  });
};
