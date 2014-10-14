'use strict';

/**
 * Module dependencies.
 */

var url = require('url');

var exports = module.exports = function users(root, options) {

//    if (!root) {
//        throw new TypeError('root path required')
//    }
    console.log("Module export users ");
    return function users(req, res, next) {
        var reqUrl = url.parse(req.url, true, true);
        console.log("request method", req.method );
        console.log("request headers", req.headers );


        console.log("request payload ",JSON.stringify( req.body, null, 4));

        var redirectPath = reqUrl.pathname.slice(3);
        var options = {
            protocol : 'http',
            port: '9200',
            hostname: '192.168.1.100',
            pathname : redirectPath,
            query : reqUrl.query
        };

        console.log("redirect to ", url.format(options) );

        next();
    }


}