"use strict";


function esapi(client, registerIndex) {
    console.log("Module model users ");
    if (!client) {
        throw new TypeError('client required');
    }
    if (!registerIndex) {
        throw new TypeError('registerIndex required');
    }
    var  registerIndexPrimary = function (payload, refresh) {
        payload = registerIndex(payload);
        payload.preference = "_primary";
        if (refresh) {
            payload.refresh = true;
        }
        return payload;
    };

    return {
        search: function (request, response) {
            var payload = registerIndex(request.body);
            console.log("request payload ", JSON.stringify(payload, null, 4));

            // Create Elasticsearch requests
            client.search(payload, function (err, resp) {
                if (err) {
                    console.error("Elasticsearch Error", err);
                }
                //    response.writeHead(resp.statusCode, resp.headers);
                response.send(resp);
            });
        },
        get: function (request, response) {
            var opt = registerIndexPrimary(request.body);
            client.get(opt, function (err, resp) {
                if (err) {
                    console.error("Elasticsearch Error", err);
                }
                response.send(resp);
            });
        },
        update: function (request, response) {
            var opt = registerIndexPrimary(request.body, true);
            client.update(opt, function (err, resp) {
                if (err) {
                    console.error("Elasticsearch Error", err);
                }
                response.send(resp);
            });
        },
        create: function (request, response) {
            var opt = registerIndexPrimary(request.body, true);
            client.create(opt, function (err, resp) {
                if (err) {
                    console.error("Elasticsearch Error", err);
                }
                response.send(resp);
            });
        },
        delete: function (request, response) {
            var opt = registerIndexPrimary(request.body, true);
            client.delete(opt, function (err, resp) {
                if (err) {
                    console.error("Elasticsearch Error", err);
                }
                response.send(resp);
            });
        }
    };
}


module.exports = esapis;