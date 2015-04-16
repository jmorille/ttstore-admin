var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  errorHandler = require('errorhandler'),
  methodOverride = require('method-override');

// Config
var  port = parseInt(process.env.PORT, 10) || 8000,
     esAddr = process.env.ES_ADDR || 'es',
     esPort = process.env.ES_PORT || '9200';

// Security
app.disable('x-powered-by');

// https://www.youtube.com/watch?v=aMblC9C68sE&index=16&list=PL37ZVnwpeshE_Um4wU9fSn6xB5VB_61R-&spfreload=10
// https://github.com/strongloop/express/tree/master/examples
// security : https://www.npmjs.com/package/helmet
var helmet = require('helmet');
//app.use(helmet.crossdomain());
//app.use(helmet.contentSecurityPolicy({
//  defaultSrc: ["'self'"],
//  reportUri: '/report-violation',
//  reportOnly: false // set to true if you only want to report errors
//}));
//app.use(helmet.frameguard('sameorigin')); // deny
//app.use(helmet.hidePoweredBy({ setTo: 'ASP.NET' }));
//app.use(helmet.hsts({ maxAge: 31536000 }));
//app.use(helmet.xssFilter({ setOnOldIE: true }));


// Cors
var cors = require('cors')
app.options('*', cors()); // include before other routes
app.use(cors()); // include before other routes

// https://github.com/senchalabs/connect#middleware
var compression = require('compression');
var fs = require('fs');


// logger
// create a write stream (in append mode)
var logger = require('morgan');
var accessLogStream = fs.createWriteStream('/log/access.log', {flags: 'a'});
app.use(logger('dev', {stream: accessLogStream})); // combined


var url = require('url');
var http = require('http');

var users = require('./models/users');
var holding = require('./models/holding');

var oauth2 = require('./models/oauth2');

var securityJWT = require('./models/security-jwt');
var securityLogin = require('./models/security-login');

var oneDay = 86400000;

// https://github.com/strongloop/express/tree/master/examples


app.use(methodOverride());
app.use(bodyParser.json({
  limit: '1mb'
}));


app.use(compression({
  threshold: 512
}));


var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: esAddr + ':' + esPort,
  log: 'info'
});



// create application/json parser
// chrome sends application/csp-report
// firefox sends application/json
// it seems chrome is doing it well: https://w3c.github.io/webappsec/specs/content-security-policy/
var jsonParser = bodyParser.json({  type: ['application/json', 'application/csp-report'] });
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: true }));

// CSP report Violation
var cspViolation = require('./models/cspViolation');
cspViolation(app, client);


// Business module
securityJWT(app);
securityLogin(app, client);
oauth2(app, client);
users(app, client);




//app.use(express.static(__dirname + '/back'));
//app.use(express.static(__dirname   ));

// logon : https://github.com/strongloop/express/blob/master/examples/auth/app.js

// Error handler - has to be last
app.use(errorHandler({
  type: 'json',
  dumpExceptions: true,
  showStack: true
}));


app.listen(port);

console.log('Simple static server listening at http://localhost:' + port);
console.log('Elasticsearch server : ' +  esAddr + ':' + esPort);
