'use strict';

/**
 * Module dependencies.
 */

var url = require('url');
var http = require('http');


function reportViolation (request, response) {
  console.err('------------- Report Violation');
  var body = request.body;
  console.err('------------- Report Violation', body);

}

function cspViolation(app, client) {
  console.log('Module model cspViolation ');
  if (!app) {
    throw new TypeError('app required');
  }
  if (!client) {
    throw new TypeError('client required');
  }
  app.post('/report-violation', reportViolation);
}


module.exports = cspViolation;

