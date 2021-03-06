'use strict';


function esapi(client, registerIndex) {
  if (!client) {
    throw new TypeError('client required');
  }
  if (!registerIndex) {
    throw new TypeError('registerIndex required');
  }
  var registerIndexPrimary = function (payload, refresh) {
    payload = registerIndex(payload);
    payload.preference = '_primary';
    if (refresh) {
      payload.refresh = true;
    }
    return payload;
  };

  return {
    search: function (request, response) {
      var payload = registerIndex(request.body);
      console.log('request payload ', JSON.stringify(payload, null, 4));

      // Create Elasticsearch requests
      client.search(payload, function (err, resp, status) {

        if (err) {
          console.error('Elasticsearch Error', err, resp);
          if (status) {
            response.status(status);
          } else {
            response.status(500);
          }
          response.send(err);
          return;
        }
        //    response.writeHead(resp.statusCode, resp.headers);
        response.status(status);
        response.send(resp);
      });
    },
    findById: function (request, response) {
      var entityId = request.params.id;
      var opt = registerIndexPrimary({
        id: entityId
      });
      client.get(opt, function (err, resp, status) {
        if (err) {
          console.error('Elasticsearch Error', err);
        }
        //  res.statusCode = 404;
        response.status(status);
        response.send(resp);
      });
    },
    // http://blog.kevinblanco.io/creating-a-simple-crud-with-node-js-express-mongodb-and-angularjs-part-1/
    update: function (request, response, next) {
      // Compplete the request
      var entityId = request.params.id;
      var opt = registerIndexPrimary(request.body, true);
      opt.id = entityId;
      // Validation
      if (!opt.version) {
        response.status(428);
        response.send({error: 'Document Version is required for update', status: 428});
        return;
      }
      // Process Undate
      console.info('Elasticsearch Request Update ', opt);
      // TODO Check field version, if not throw exception (security rules for force concurency pb)
      client.update(opt, function (err, resp, status) {
        if (err) {
          console.error('-------------------------------------');
          console.error('Elasticsearch Error', err, ' for option ', opt);
          console.error('-------');
          console.error('Elasticsearch Response', resp);
          console.error('-------------------------------------');
        }
        response.status(status);
        response.send(resp);
      });
    },
    create: function (request, response) {
      var opt = registerIndexPrimary(request.body, true);
      client.create(opt, function (err, resp, status) {
        if (err) {
          console.error('Elasticsearch Error', err);
        }
        response.status(status);
        response.send(resp);
      });
    },
    delete: function (request, response) {
      var entityId = request.params.id;
      var opt = registerIndexPrimary(request.body, true);
      opt.id = entityId;
      // Process Delete
      console.log('Asked delete for ', opt );
      client.delete(opt, function (err, resp, status) {
        console.log('Client delete response', err , resp, status);
        if (err) {
          console.error('Elasticsearch Error', err);
          if (!status) {
            response.status(400);
          } else {
            response.status(status);
          }
          response.send(err);
          return;
        }
        response.status(status);
        response.send(resp);
      });
    }
  };
}


module.exports = esapi;
