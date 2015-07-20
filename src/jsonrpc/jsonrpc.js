// Copyright 2015 Michael Bürge. All rights reserved.

/**
 * @fileoverview Provides the jsonrpc package.
 *
 * TODO:
 * - Call options
 * - Endpoint configuration (path is currently hardcoded to /jsonrpc in transports)
 * - Retries.
 */


goog.provide('jsonrpc');

goog.require('goog.Promise');
goog.require('jsonrpc.Error');
goog.require('jsonrpc.XhrIoTransport');


/**
 * @type {jsonrpc.Transport}
 */
jsonrpc.defaultTransport = new jsonrpc.XhrIoTransport;


/**
 * @param {string} method
 * @param {Object=} opt_params
 * @return {goog.Promise<Object>}
 */
jsonrpc.call = function(method, opt_params) {
  return new goog.Promise(function(resolve, reject) {
    jsonrpc.defaultTransport.performCall(method, opt_params)
    .then(function(responseJson) {
      var result = responseJson['result'];
      var error = responseJson['error']
      if (result) {
        resolve(result);
      } else if (error) {
        // Allow strings as errors. This is slightly more permissive than the
        // JSONRPC specification, which mandates an error object.
        if (goog.isString(error)) {
          reject(new jsonrpc.Error(jsonrpc.ErrorCode.APPLICATION_ERROR, error));
        } else {
          reject(jsonrpc.Error.fromJson(error));
        }
      } else {
        reject(new jsonrpc.Error(jsonrpc.ErrorCode.INTERNAL_ERROR));
      }
    })
    .then(undefined, function(error) {
      reject(error);
    });
  });
};



