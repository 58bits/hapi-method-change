'use strict';

var Boom = require('boom');

exports.register = function (server, options, next) {

  // Switch method if the querystring parameter is present.
  server.ext('onRequest', function (request, reply) {
    if(request.method === 'post' && request.query && request.query._method) {
      const method = request.query._method;
      if(method === 'put' || method === 'patch' || method === 'delete') {
        request.setMethod(method);
      }
      delete request.query._method;
    }
    return reply.continue();
  });

  // Verify the method request against the hidden form field and if okay,
  // remove the hidden form value from payload.
  server.ext('onPreHandler', function (request, reply) {
    if(request.payload && request.payload._method) {
      if(request.payload._method !== request.method) {
        return Boom.methodNotAllowed('Invalid request method.');
      } else {
        delete request.payload._method;
        return reply.continue();
      }
    } else {
      return reply.continue();
    }
  });

  return next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
