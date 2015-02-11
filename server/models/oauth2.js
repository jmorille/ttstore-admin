/**
 * Module dependencies.
 */
// http://javascriptplayground.com/blog/2013/06/node-and-google-oauth/

var googleapis = require('googleapis');

exports.ping = function() {
  console.log('pong');
};


function oauth2(app, client) {
  console.log('Module model users ');
  if (!app) {
    throw new TypeError('app required');
  }
  if (!client) {
    throw new TypeError('client required');
  }


  app.get('/s/oauth2callback', function(req, resp) {
    var code = req.query.code;
    console.log('Google oauth2callback : ' , code);

    var locals = {
      title: 'My sample app',
      code: code
    };
    resp.send(locals);
  });

  app.post('/s/oauth2callback', function(req, resp) {
    var code = req.body.code;
    console.log('POST Google oauth2callback : ' , code);

  });
}


module.exports = oauth2;
