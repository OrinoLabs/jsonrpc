// Copyright 2015 Michael Bürge <mib@orino.ch>
// All rights reserved.
/**
 * @fileoverview Provides the jsonrpc package.
 */


goog.provide('jsonrpc');

goog.require('goog.Promise');
goog.require('jsonrpc.Error');



// All browsers implement Promise#catch nowadays.
// Ensure goog.Promise also has it.
if (!goog.Promise.prototype.catch) {
  goog.Promise.prototype.catch = goog.Promise.prototype.thenCatch;
}



/**
 * @typedef {{
 *   endpoint: (undefined|jsonrpc.HttpEndpoint),
 *   maxAttempts: (undefined|number),
 *   shouldRetry: (undefined|function(jsonrpc.Error):boolean),
 *   callId: (undefined|string)
 * }}
 */
jsonrpc.CallOptions;


/**
 * @type {jsonrpc.Client}
 */
jsonrpc.defaultClient = null;


/**
 * The default call timeout (in milliseconds).
 * @type {number}
 */
jsonrpc.defaultCallTimeout = 10000;


/**
 * @param {string} method
 * @param {Object=} opt_params
 * @param {jsonrpc.CallOptions=} opt_opts
 * @return {goog.Promise<Object>}
 */
jsonrpc.call = function(method, opt_params, opt_opts) {
  if (!jsonrpc.defaultClient) {
    throw new Error('No default client.');
  }
  return jsonrpc.defaultClient.call(method, opt_params, opt_opts);
};
