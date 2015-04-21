'use strict';

var validateFunc = function (decoded, request, callback) {

  var session = {
    index : "session",
    type  : "user",
    id    : decoded.jti  // use SESSION ID as key for sessions
  } // jti? >> http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#jtiDef

  request.server.methods.es.get(session, function (err, res) {
    if(res.found && !res._source.ended) {
      return callback(null, true); // session is valid
    }
    else {
      return callback(null, false); // session expired
    }
  });

};

module.exports = validateFunc;
