'use strict';


var userController = require('./../controllers/user');

module.exports = function validate (request, email, password, callback) {
//  console.log('Basic Auth : --- ',request!=null);
//  console.log('Basic Auth : --- ', email, password);
  userController.verifyPasswordByEmail(request, email, password, function (err, isValid, res) {
    //console.log('Basic Auth : --- ', email, password, ' is Valid', isValid, ' ==>', res);
    //console.log('Basic Auth : --- Error  ', err);
    if (isValid) {
      console.log('Basic Auth Validate for : --- isValid  ', { userId: res._id, email: res._source.email });
      callback(err, isValid, { userId: res._id, email: res._source.email, verified_email: res._source.verified_email|| false });
    } else {
      callback(err, isValid );
    }
  });
};
