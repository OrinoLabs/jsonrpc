// Copyright 2015 Michael Bürge. All rights reserved.

/**
 * @fileoverview Provides the jsonrpc package.
 */


goog.provide('jsonrpc');

goog.require('goog.Promise');
goog.require('jsonrpc.JsonRpcIo');



/**
 * @param {string} method
 * @param {Object=} opt_params
 * @return {Promise<Object>}
 */
jsonrpc.call = function(method, opt_params) {
  return new goog.Promise(function(resolve, reject) {
    var rpcIo = new jsonrpc.JsonRpcIo(method)
    if (opt_params) {
      rpcIo.setParameters(opt_params);
    }
    rpcIo.listen(
        goog.net.EventType.COMPLETE,
        function(e) {
          if (e.result) {
            resolve(e.result);
          } else {
            reject(e.error);
          }
        });
    rpcIo.send();
  })
};



