// Copyright Michael Bürge <mib@orino.ch>
// All rights reserved.


goog.provide('jsonrpc.Dispatcher');



/**
 * @typedef {function(Object): (Promise|*)}
 */
jsonrpc.MethodHandler;


/**
 * @constructor
 */
jsonrpc.Dispatcher = function() {
  /**
   * @type {Object.<name, jsonrpc.MethodHandler}
   */
  this.handlers_ = {};
};


/**
 * @type {function(string, Object): (Promise|*)}
 */
jsonrpc.Dispatcher.prototype.catchAllHandler_ = null;


/**
 * @param {function(string, Object): (Promise|*)} handler
 */
jsonrpc.Dispatcher.prototype.setCatchAllHandler = function(handler) {
  this.catchAllHandler_ = handler;
};


/**
 * @param {string} methodName
 * @param {jsonrpc.MethodHandler} handler
 */
jsonrpc.Dispatcher.prototype.addMethod = function(methodName, handler) {
  this.handlers_[methodName] = handler;
};


/**
 * @param {string} methodName
 * @param {Object} params
 * @return {Promise<*>}
 */
jsonrpc.Dispatcher.prototype.dispatchCall = function(methodName, params) {
  return new goog.Promise(function(resolve, reject) {
    var handler = this.handlers_[methodName];

    if (!handler && this.catchAllHandler_) {
      handler = this.catchAllHandler_.bind(null, methodName);
    }

    if (!handler) {
      console.log('[jsonrpc] No handler for method: ' + methodName);
      reject(new jsonrpc.Error(
          jsonrpc.ErrorCode.METHOD_NOT_FOUND, null, methodName));
      return;
    }

    try {
      var handlerReturnValue = handler(params);
    } catch (err) {
      console.log('[jsonrpc] ERROR: Exception caught executing handler: ', err);
      reject(new jsonrpc.Error(
          jsonrpc.ErrorCode.INTERNAL_ERROR, null, err));
    }

    // Did the handler return a promise?
    if (handlerReturnValue.then) {
      var resultPromise = handlerReturnValue;
    } else {
      var resultPromise = goog.Promise.resolve(handlerReturnValue);
    }

    resultPromise
    .then(resolve)
    .then(null, function(err) {
      if (err instanceof jsonrpc.Error) {
        reject(err);
      } else {
        reject(new jsonrpc.Error(
            jsonrpc.ErrorCode.INTERNAL_ERROR, null, err));
      }
    })
  }.bind(this));
};

