// Copyright 2015 Michael Bürge <mib@orino.ch>
// All right reserved.


goog.provide('jsonrpc.NodeHttpTransport');

goog.require('goog.Promise');
goog.require('jsonrpc.Error');
goog.require('jsonrpc.Transport');


var http = require('http');


/**
 * @constructor
 * @implements {jsonrpc.Transport}
 */
jsonrpc.NodeHttpTransport = function() {};


/**
 * Whether chunking is used for requests.
 * @type {boolean}
 */
jsonrpc.NodeHttpTransport.prototype.chunkedRequests = true;


/**
 * @inheritDoc
 */
jsonrpc.NodeHttpTransport.prototype.performCall = function(method, opt_params, opt_opts) {
  var opts = opt_opts || {};

  var payloadData = {
    'method': method,
    'params': opt_params || {}
  };
  var payload = new Buffer(JSON.stringify(payloadData), 'utf-8');

  var reqOpts = {
    host: opts.endpoint && opts.endpoint.host || 'localhost',
    port: opts.endpoint && opts.endpoint.port || 80,
    path: opts.endpoint && opts.endpoint.path || jsonrpc.defaultEndpoint.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    }
  };

  if (!this.chunkedRequests) {
    reqOpts.headers['Transfer-Encoding'] = '';
    reqOpts.headers['Content-Length'] = payload.length;
  }

  return new goog.Promise(function(resolve, reject) {
    var httpRequest = http.request(reqOpts, function(httpResponse) {
      var responseData = '';
      httpResponse.on('data', function(data) {
        responseData += data;
      })

      httpResponse.on('error', function(err) {
        reject(new jsonrpc.Error(jsonrpc.ErrorCode.TRANSPORT_ERROR, null, err));
      });

      httpResponse.on('end', function() {
        try {
          var jsonRpcResponse = JSON.parse(responseData);
        } catch (err) {
          reject(new jsonrpc.Error(jsonrpc.ErrorCode.PARSE_ERROR, null, err));
          return;
        }
        resolve(jsonRpcResponse);
      });
    });

    httpRequest.on('error', function(err) {
      reject(new jsonrpc.Error(jsonrpc.ErrorCode.TRANSPORT_ERROR, null, err));
    });

    httpRequest.setTimeout(jsonrpc.defaultCallTimeout, function() {
      httpRequest.abort();
    });

    httpRequest.write(payload);
    httpRequest.end();
  });
};


