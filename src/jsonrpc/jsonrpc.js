// Copyright 2015 Michael Bürge. All rights reserved.

/**
 * @fileoverview Provides the jsonrpc package.
 */


goog.provide('jsonrpc');

goog.require('goog.Promise');
goog.require('jsonrpc.JsonRpcIoTransport');


/**
 * @type {jsonrpc.Transport}
 */
jsonrpc.defaultTransport = new jsonrpc.JsonRpcIoTransport;


/**
 * @param {string} method
 * @param {Object=} opt_params
 * @return {goog.Promise<Object>}
 */
jsonrpc.call = function(method, opt_params) {
  return jsonrpc.defaultTransport.performCall(method, opt_params);
};



