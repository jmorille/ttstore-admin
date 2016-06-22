'use strict';

const JWT = require('jsonwebtoken');  // used to sign our content
const aguid = require('aguid');

const Config = require("../config");
const Providers = Config.get('/provider');

const internal = {};

internal.createSession = function(request) {
  // payload is the object that will be signed by JWT below
  let now = new Date().getTime();

  let session = {
    valid: true, // this will be set to false when the person logs out
    id: aguid(), // a random session id
    exp: now + Providers.jwt.expTime // expires in 30 minutes time
  };
  if (request.auth && request.auth.isAuthenticated) {
    session.iss = request.auth.credentials._id;
    session.userId =  request.auth.credentials.userId;
  } // see: http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#issDef
  else { // no email is set (means an anonymous person)
    session.iss = "anonymous";
  } //
  return session;
};

module.exports = function sign(request, reply) {

  console.log('JWT SIGN     -- ', request.auth);

  // session is the object that will be signed by JWT below
  let session = internal.createSession (request);

  let token = JWT.sign(session, Providers.jwt.jwtSecret); // https://github.com/docdis/learn-json-web-tokens
  console.log('Signin Token', JSON.stringify(session));

  //let sessionBack = {   // set up session record for inserting into ES
  //  index: "users_session",
  //  type: "user",
  //  id: payload.jti,
  //  body: {
  //    person: payload.iss,
  //    ua: request.headers['user-agent'],
  //    ct: new Date().toISOString()
  //  }
  //};
  //request.server.methods.es.index(sessionBack, function (err, res) {
  //  console.log('JWT SIGN   return   -- ', token, res);
  //  return callback(token, res);
  //});
  let res = {
    text: 'Check Auth Header for your Token',
    token: token
  };
  return reply( res)
    .header("Authorization", token);
};
