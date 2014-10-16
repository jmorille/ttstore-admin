'use strict';

/**
 * Module dependencies.
 */

var url = require('url');
var http = require('http');

var exports = module.exports = function users(client, options) {
    console.log("Module model users ");
    if (!client) {
        throw new TypeError('client required')
    }
    return function users(request, response) {
        var reqUrl = url.parse(request.url, true, true);
        //console.log("request method", request.method);
        // console.log("request headers", request.headers);
        console.log("****************************************");
        // post data
        var payload = request.body;
        payload.index = 'users';
        payload.type = 'user';
        // payload._sourceExclude = ['firstname'];


        console.log("request payload ", JSON.stringify(payload, null, 4));

        // http://stackoverflow.com/questions/6158933/how-to-make-an-http-post-request-in-node-js

        // Create Elasticsearch requests

        client.search(payload, function (err, resp) {
            if (err) {
                console.error("Elasticsearch Error", err);
            }
            //    response.writeHead(resp.statusCode, resp.headers);
            response.send(resp);
        });
    }


}