var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    port = parseInt(process.env.PORT, 10) || 8000;


// https://github.com/senchalabs/connect#middleware
var compression = require('compression');
var serveStatic = require('serve-static');

var url = require('url');
var http = require('http');

// https://github.com/strongloop/express/tree/master/examples

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(compression({
    threshold: 512
}));


var oneDay = 86400000;

app.route('/components/*')
    .get(function (req, res, next) {
        console.log(new Date(Date.now()).toUTCString(), "-", req.method, "-", req.url);
        res.setHeader("Cache-Control", "public, max-age=" + oneDay); // 1 days
        res.setHeader("Expires", new Date(Date.now() + oneDay * 1000).toUTCString());
        res.setHeader("Pragma", "cache");
        next();
    });

//app.use(function (req, res, next) {
//     console.log(new Date(Date.now()).toUTCString(), req.method, req.url);
//    if(req.url.indexOf("/components/") === 0) {
//       res.setHeader("Cache-Control", "public, max-age="+oneDay); // 1 days
//       res.setHeader("Expires", new Date(Date.now() + oneDay*1000).toUTCString());
//    }
//    next();
//});


app.use(serveStatic(__dirname + '/back', {  'index': ['index.html', 'index.htm']}))

app.route('/es/*')
    .all(function (request, response, next) {
        // https://gist.github.com/cmawhorter/a527a2350d5982559bb6
        console.log('******', new Date(Date.now()).toUTCString(), "-", request.method, "-", request.url);
        // request.pause(); // Pause the request

        // Construct Redirect
        var redirectPath = request.url.slice(3);
        //console.log('****** redirect path', redirectPath);

        //var options = url.parse("http://192.168.1.100:9200" + redirectPath);
        var options = url.parse( "http://localhost:9200"+redirectPath);
        // console.dir(options);
        options.headers = request.headers;
        options.method = request.method;
        options.agent = false;
        //console.dir(request);
        // Init connector
        var connector = http.request(options, function (res) {
            response.writeHead(res.statusCode, res.headers);
            res.pipe(response, {end: true });//tell 'response' end=true
            console.log('    *', new Date(Date.now()).toUTCString(), "-", "statusCode", res.statusCode);
        });
        request.pipe(connector, {end: true});
        // request.resume();// Resume the request
    });


//app.use(express.static(__dirname + '/back'));
//app.use(express.static(__dirname   ));


app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
}));

app.listen(port);
console.log("Simple static server listening at http://localhost:" + port);
