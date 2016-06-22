'use strict';

var validateFunc = function authJwtValidate(decoded, request, callback) {
 // console.log('JWT Validate  (auth_jwt_validate.js)   -- ', request.auth);
 // console.log('JWT Decoded (auth_jwt_validate.js)   -- ', decoded);
  var session = {
    index : "users_session",
    type  : "user",
    id    : decoded.jti  // use SESSION ID as key for sessions
  } // jti? >> http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#jtiDef
  console.log('JWT Validate   return   -- ', decoded, true);
//  return callback(null, false); // session expired
  return callback(null, true); // session is valid

  //request.server.methods.es.get(session, function (err, res) {
  //  if(res.found && !res._source.ended) {
  //    return callback(null, true); // session is valid
  //  }
  //  else {
  //    return callback(null, false); // session expired
  //  }
  //});

};

module.exports = validateFunc;
