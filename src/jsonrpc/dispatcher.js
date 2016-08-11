// Copyright Michael Bürge <mib@orino.ch>
// All rights reserved.


goog.provide('jsonrpc.Dispatcher');

goog.require('goog.log');
goog.require('goog.Promise');
goog.require('jsonrpc.Error');


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


/** @type {goog.debug.Logger} */
jsonrpc.Dispatcher.prototype.logger = goog.log.getLogger('jsonrpc.Dispatcher');


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
      this.logger.severe('No handler for method "' + methodName + '".');
      reject(new jsonrpc.Error(
          jsonrpc.ErrorCode.METHOD_NOT_FOUND, undefined, methodName));
      return;
    }

    var resultPromise;
    try {
      var handlerReturnValue = handler(params);
      // Did the handler return a promise?
      if (handlerReturnValue.then) {
        resultPromise = handlerReturnValue;
      } else {
        resultPromise = goog.Promise.resolve(handlerReturnValue);
      }
    } catch (err) {
      resultPromise = goog.Promise.reject(err);
    }

    resultPromise
    .then(resolve)
    .then(null, function(err) {
      var logMsg = 'Call to "' + methodName + '" failed: ' + err;
      if (err instanceof jsonrpc.Error) {
        this.logger.fine(logMsg);
        reject(err);
      } else {
        // NOTE: JSON.stringify(<Error instance>) just yields {}.
        // To propagate something useful, use the result of Error#toString()
        // in that case.
        if (err instanceof Error && err.stack) {
          logMsg += '\n' + err.stack;
        }
        this.logger.severe(logMsg);
        reject(new jsonrpc.Error(
            jsonrpc.ErrorCode.APPLICATION_ERROR, undefined, err));
      }
    }.bind(this))
  }.bind(this));
};

