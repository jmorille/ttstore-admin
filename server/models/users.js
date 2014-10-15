'use strict';

/**
 * Module dependencies.
 */

var url = require('url');
var http = require('http');

var exports = module.exports = function users(client, options) {

    if (!client) {
        throw new TypeError('client required')
    }
    console.log("Module export users ");
    return function users(request, response) {
        var reqUrl = url.parse(request.url, true, true);
        //console.log("request method", request.method);
        console.log("request headers", request.headers);
        //console.log("request payload ", JSON.stringify(request.body, null, 4));

        // post data
        var payload = request.body;
        // http://stackoverflow.com/questions/6158933/how-to-make-an-http-post-request-in-node-js
        
        var redirectPath = reqUrl.pathname.slice(3);
        var options = {
            protocol: 'http:',
            port: '9200',
            hostname: '192.168.1.100',
            headers: request.headers,
            method: request.method,
            pathname: redirectPath,
            query: reqUrl.query,
            body: payload
        };
        console.log("redirect to ", url.format(options));

        var esConnector = http.request(options, function (res) {
            console.log("Redirect", options);
            response.writeHead(res.statusCode, res.headers);
            res.pipe(response, {end: true })
                .on('error', function (e) {
                    console.error("Error in pipe redirect", e);
                });//tell 'response' end=true
            console.log('    *', new Date(Date.now()).toUTCString(), "-", "statusCode", res.statusCode);
        });
        esConnector.on('error', function (e) {
            console.error("Error in request redirect", e);
        });
       // request.pipe(esConnector, {end: true});

        // post the data
        post_req.write(post_data);
        post_req.end();


        // next();
    }


}