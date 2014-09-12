var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    port = parseInt(process.env.PORT, 10) || 8000;

// https://github.com/senchalabs/connect#middleware
var compression = require('compression');
var serveStatic = require('serve-static');

// https://github.com/strongloop/express/tree/master/examples

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(compression({
    threshold: 512
}))


app.use(serveStatic(__dirname + '/back', {  'index': ['index.html', 'index.htm']}))

//app.use(express.static(__dirname + '/back'));
//app.use(express.static(__dirname   ));


app.get('/sss', function(req, res){
    res.redirect('/user/0');
});



app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
}));

app.listen(port);
console.log("Simple static server listening at http://localhost:" + port);
