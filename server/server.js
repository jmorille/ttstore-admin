var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    port = parseInt(process.env.PORT, 10) || 8000;

// Security
app.disable('x-powered-by');

// https://www.youtube.com/watch?v=aMblC9C68sE&index=16&list=PL37ZVnwpeshE_Um4wU9fSn6xB5VB_61R-&spfreload=10
// https://github.com/strongloop/express/tree/master/examples
// security : https://www.npmjs.com/package/helmet
var helmet = require('helmet');
app.use(helmet.crossdomain());
app.use(helmet.contentSecurityPolicy({
  defaultSrc: ["'self'"],
  reportUri: '/report-violation',
  reportOnly: false // set to true if you only want to report errors
}));
app.use(helmet.frameguard('sameorigin')); // deny
app.use(helmet.hidePoweredBy({ setTo: 'ASP.NET' }));
app.use(helmet.hsts({ maxAge: 31536000 }));
app.use(helmet.xssFilter({ setOnOldIE: true }));
//app.disable('x-powered-by');


// https://github.com/senchalabs/connect#middleware
var compression = require('compression');
var serveStatic = require('serve-static');
var fs = require('fs');


// logger
// create a write stream (in append mode)
var logger = require('morgan');
var accessLogStream = fs.createWriteStream('/log/access.log', {flags: 'a'});
app.use(logger('dev', {stream: accessLogStream})); // combined


var url = require('url');
var http = require('http');

var users = require('./models/users');
var oauth2 = require('./models/oauth2');

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
    host: 'es:9200',
    log: 'info'
});


// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser

oauth2(app, client);
users(app, client);


app.route('/esx/*')
    .all(function (request, response, next) {
        var start = new Date();

        // https://gist.github.com/cmawhorter/a527a2350d5982559bb6
        console.log('******', new Date(Date.now()).toUTCString(), '-', request.method, '-', request.url);
        console.log('request content-type', request.headers['content-type']);
        // request.pause(); // Pause the request
        // Construct Redirect
        var redirectPath = request.url.slice(3);
        //console.log('****** redirect path', redirectPath);

        //var options = url.parse('http://192.168.1.100:9200' + redirectPath);
        //var options = url.parse('http://localhost:9200' + redirectPath);
        var options = url.parse('http://' + process.env.ES_1_PORT_9200_TCP_ADDR + ':9200' + redirectPath);

        options.headers = request.headers;
        options.method = request.method;
        // options.agent = new http.Agent();
        // options.agent.maxSockets = 1000000;


        // Init connector : http://stackoverflow.com/questions/6209042/node-js-http-request-slows-down-under-load-testing-am-i-doing-something-wrong
        var esConnector = http.request(options, function (res) {
            response.writeHead(res.statusCode, res.headers);
            res.pipe(response, {end: true })
                .on('error', function (e) {
                    console.error('Error in pipe redirect', e);
                });//tell 'response' end=true
            console.log('    *', new Date(Date.now()).toUTCString(), '-', 'statusCode', res.statusCode);
        });
        esConnector.on('error', function (e) {
            console.error('Error in request redirect', e);
        });
        request.pipe(esConnector, {end: true});


//        request.on('data', function (chunk) {
//            console.log('Received body data:');
//            console.log(chunk);
        //           connector.write(chunk);
        //       });


        // request.resume();// Resume the request
    });


//app.use(express.static(__dirname + '/back'));
//app.use(express.static(__dirname   ));

// logon : https://github.com/strongloop/express/blob/master/examples/auth/app.js

app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
}));


app.listen(port);

console.log('Simple static server listening at http://localhost:' + port);

console.log('Elasticsearch server : ' + process.env.ES_1_PORT_9200_TCP_ADDR);
