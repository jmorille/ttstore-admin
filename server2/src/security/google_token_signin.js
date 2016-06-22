'use strict';
const fetch = require('node-fetch');
const Joi = require('joi');

const JwtSingin = require("../security/auth_jwt_signin");

var internal = {};

internal.tokenSigninSchema =  Joi.object().keys({
  iss: Joi.any().valid(['accounts.google.com', 'https://accounts.google.com']),
  aud:  Joi.string().valid(GoogleProviders.aud),
  exp:  Joi.date().timestamp('unix'),
  email: Joi.string().email(),
  picture: Joi.string().uri({ scheme: [ 'http', 'https']}),
  name: Joi.string(),
  given_name: Joi.string(),
  family_name: Joi.string(),
  locale: Joi.string(),
}).with('iss', 'aud', 'exp');


internal.tokenSigninValidateOptions ={
  abortEarly: true,
  convert: true,
  allowUnknown: true,
  skipFunctions: true
};


internal.tokenSigninValidate = function(response) {

};

module.exports = function googleTokenSingnin(request, reply) {
  let body = request.payload;
  let tokenId = body.id_token;
  console.log('----- Google tokensignin' );
  console.log('----- Google tokensignin tokenId : ', tokenId );


  // Send the ID token to your server
  // https://developers.google.com/identity/sign-in/web/backend-auth
  fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='+tokenId,
    {redirect: 'follow'}
  ).then(response => {
    return response.json();
  }).then(response => {
    console.log('Google token', response);
    let isValid = false;
    Joi.validate(response, internal.tokenSigninSchema, internal.tokenSigninValidateOptions, (err, value) => {
      console.log('Google is valid : ', err);
      if (!err) {
        var nowTime = (new Date()).getTime();
        console.log('exp : ', value.exp.getTime());
        console.log('now : ', Date.now() );
        if ( value.exp.getTime() >= nowTime) {
          isValid = true;
        }
      }
    } );

  });

  let res = {
    hello: 'Hello',
    tokenId: tokenId,
    payload: request.payload
  };

  JwtSingin(request, reply);
//  var token = JWT.sign(session, process.env.JWT_SECRET); // synchronous

 // reply(res);
};

