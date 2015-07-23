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


/**
 * @typedef {{
 *   maxAttempts: number,
 *   shouldRetry: function(jsonrpc.Error):boolean
 * }}
 */
jsonrpc.CallOptions;


/**
 * @type {jsonrpc.Transport}
 */
jsonrpc.defaultTransport;


/**
 * @param {string} method
 * @param {Object=} opt_params
 * @param {jsonrpc.CallOptions=} opt_opts
 * @return {goog.Promise<Object>}
 */
jsonrpc.call = function(method, opt_params, opt_opts) {
  var opts = opt_opts || {};

  var transport = jsonrpc.defaultTransport;
  if (!transport) {
    throw new Error('No transport specified.');
  }

  var maxAttempts = opts.maxAttempts || 1;
  var attempt = 0;

  return new goog.Promise(function(resolve, reject) {
    function attemptCall() {
      attempt += 1;

      jsonrpc.performCall_(transport, method, opt_params)
      .then(function(result) {
        resolve(result);
      })
      .then(null, function(err) {
        if (attempt == maxAttempts) {
          reject(err);
        } else if (opts.shouldRetry && !opts.shouldRetry(err)) {
          reject(err);
        } else {
          attemptCall();
        }
      });
    }

    attemptCall();
  })
};


/**
 * @param {jsonrpc.Transport} transport
 * @parma {string} method
 * @param {Object=} opt_params
 */
jsonrpc.performCall_ = function(transport, method, opt_params) {
  return new goog.Promise(function(resolve, reject) {
    transport.performCall(method, opt_params)
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
}


