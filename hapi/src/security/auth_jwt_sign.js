'use strict';

var JWT = require('jsonwebtoken');  // used to sign our content
var aguid = require('aguid');

var Config = require("../config");
var Providers = Config.get('/provider');


module.exports = function sign(request, callback) {

  console.log('JWT SIGN     -- ', request.auth);

  // payload is the object that will be signed by JWT below
  var now = new Date().getTime();
  var payload = {
    jti: aguid(),
    iat : now,
    exp: now + Providers.jwt.expTime,
    agent: request.headers['user-agent']
  }; // v4 random UUID used as Session ID below

  if (request.auth && request.auth.isAuthenticated) {
    payload.iss = request.auth.credentials._id;
    payload.userId =  request.auth.credentials.userId;
  } // see: http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#issDef
  else { // no email is set (means an anonymous person)
    payload.iss = "anonymous";
  } // this will need to be extended for other auth: http://git.io/pc1c

  var token = JWT.sign(payload, Providers.jwt.jwtSecret); // https://github.com/docdis/learn-json-web-tokens
  console.log('Sign Token', JSON.stringify(payload));

  var session = {   // set up session record for inserting into ES
    index: "users_session",
    type: "user",
    id: payload.jti,
    body: {
      person: payload.iss,
      ua: request.headers['user-agent'],
      ct: new Date().toISOString()
    }
  };
  request.server.methods.es.index(session, function (err, res) {
    console.log('JWT SIGN   return   -- ', token, res);
    return callback(token, res);
  });

}
