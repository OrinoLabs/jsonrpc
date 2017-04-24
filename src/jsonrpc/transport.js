// Copyright 2015 Michael Bürge. All rights reserved.



goog.provide('jsonrpc.Transport');


// TODO: Add typing for promise result .


/**
 * @interface
 */
jsonrpc.Transport = function() {};


/**
 * @param {string} callId
 * @param {string} method
 * @param {Object=} opt_params
 * @param {jsonrpc.CallOptions=} opt_opts
 * @return {goog.Promise<!Object>} The JSONRPC response object.
 */
jsonrpc.Transport.prototype.performCall = goog.abstractMethod;

