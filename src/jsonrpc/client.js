


goog.provide('jsonrpc.Client');

goog.require('goog.Promise');
goog.require('jsonrpc');


/**
 * @param {jsonrpc.Transport} transport
 * @constructor
 */
jsonrpc.Client = function(transport) {
  /**
   * @type {jsonrpc.Transport}
   * @private
   */
  this.transport_ = transport;
};


/**
 * Generates a call id.
 * @return {string}
 */
jsonrpc.Client.generateCallId = (function() {
  var prefix = Math.floor(Math.random() * Math.pow(36, 4)).toString(36) + '-';
  var counter = 0;
  return function() {
    return prefix + (counter++).toString(36);
  };
})();



/**
 * @param {string} method
 * @param {Object=} opt_params
 * @param {jsonrpc.CallOptions=} opt_opts
 * @return {goog.Promise<Object>}
 */
jsonrpc.Client.prototype.call = function(method, opt_params, opt_opts) {
  var opts = opt_opts || {};

  var maxAttempts = opts.maxAttempts || 1;
  var attempt = 0;

  return new goog.Promise(function(resolve, reject) {
    var attemptCall = function() {
      attempt += 1;

      this.performCall_(method, opt_params, opt_opts)
      .then(function(result) {
        resolve(result);
      })
      .then(null, function(err) {
        err = /** @type {jsonrpc.Error} */(err);
        if (attempt == maxAttempts) {
          reject(err);
        } else if (opts.shouldRetry && !opts.shouldRetry(err)) {
          reject(err);
        } else {
          attemptCall();
        }
      });
    }.bind(this);

    attemptCall();
  }.bind(this));
};


/**
 * @param {string} method
 * @param {Object=} opt_params
 * @param {jsonrpc.CallOptions=} opt_opts
 * @return {!goog.Promise}
 */
jsonrpc.Client.prototype.performCall_ = function(method, opt_params, opt_opts) {
  var resolver = goog.Promise.withResolver();

  var callId = (opt_opts && opt_opts.callId) || jsonrpc.Client.generateCallId();

  this.transport_.performCall(callId, method, opt_params, opt_opts)
  .then(function(response) {
    var result = response['result'];
    var error = response['error'];
    if (result) {
      resolver.resolve(result);

    } else if (error) {
      // Allow strings as errors. This is slightly more permissive than the
      // JSONRPC specification, which mandates an error object.
      if (goog.isString(error)) {
        resolver.reject(new jsonrpc.Error(jsonrpc.ErrorCode.APPLICATION_ERROR, error));
      } else {
        resolver.reject(jsonrpc.Error.fromJson(error));
      }
    } else {
      // TODO: Maybe introduce a separate error code for this.
      resolver.reject(new jsonrpc.Error(
          jsonrpc.ErrorCode.INTERNAL_ERROR,
          'Internal error: Malformed response received from transport.'));
    }
  })
  .then(null, function(error) {
    resolver.reject(error);
  });

  return resolver.promise;
}


