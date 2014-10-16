"use strict";

/**
 * Module dependencies.
 */

var url = require('url');
var http = require('http');

var esapi = require('./crud-es');

function registerIndex(payload) {
    payload.index = 'users';
    if (!payload.type) {
        payload.type = 'user';
    }
    payload._sourceExclude = ['password'];
    return payload;
}


function users(client) {
    console.log("Module model users ");
    if (!client) {
        throw new TypeError('client required');
    }
    return esapi(client, registerIndex);
}


module.exports = users;

