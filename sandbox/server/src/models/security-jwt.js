/**
 * Json Web Token Module dependencies.
 */
// http://www.spaceinvade.rs/2014/08/16/MEAN-stack-with-CouchDB-express4-angularjs/
// http://blog.matoski.com/articles/jwt-express-node-mongoose/


// Json Web Token
var jwt = require('express-jwt');

var SECRET = 'shhhhhhared-secret';

function securityJWT(app) {
  console.log('Module model Security Json Web Token');

  //specify the path where will reside all your JWT secured apis, and tell it which passphrase encryption to use
  //Thanks to unless, you can also specify exception: routes that will not be restricted
  app.set('secret', SECRET);
  app.use('/api/', jwt({secret: SECRET})
      .unless({path: ['/api/auth', '/api/login', '/api/signup']})
  )
  // /report-violation'

}


module.exports = securityJWT;
