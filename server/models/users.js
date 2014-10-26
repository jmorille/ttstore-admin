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


function users(app, client) {
    console.log("Module model users ");
    if (!app) {
        throw new TypeError('app required');
    }
    if (!client) {
        throw new TypeError('client required');
    }

    var crudapi =  esapi(client, registerIndex);
    var index = 'users';


    app.post('/'  + index + '/_search', crudapi.search);
    app.get('/'  + index + '/:id',  crudapi.findById);
    app.post('/'  + index, crudapi.create);
    app.put('/'  + index + '/:id', crudapi.update);
    app.delete('/'  + index + '/:id', crudapi.delete);

}


module.exports = users;

