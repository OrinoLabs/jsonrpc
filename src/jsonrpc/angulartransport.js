// Copyright 2015 Michael Bürge. All rights reserved.


goog.provide('jsonrpc.AngularTransport');

goog.require('jsonrpc.Transport');



jsonrpc.ngModule = (function() {
  if (typeof angular == 'undefined') {
    throw new Error('Angular library is not present.');
  }
  return angular.module('jsonrpc', []);
})();


/**
 * Acquires the angular $http service.
 * @private
 * @ngInject
 */
jsonrpc.acquireHttpService_ = function($http) {
  /**
   * The angular http service.
   * @private
   */
  jsonrpc.$http_ = $http;
}
jsonrpc.ngModule.run(jsonrpc.acquireHttpService_);



/**
 * @constructor
 * @implements {jsonrpc.Transport}
 */
jsonrpc.AngularTransport = function() {};


/**
 * @inheritDoc
 */
jsonrpc.AngularTransport.prototype.performCall = function(method, opt_params) {
  var payload = {
    method: method,
    params: opt_params || {}
  }
  return jsonrpc.$http_({
    method: 'POST',
    url: '/jsonrpc',
    data: JSON.stringify(payload)
  })
  .then(function(httpPromise) {
    // NOTE: Response needs to specify correct content type (application/json) 
    // in order for Angular to automatically parse the result.
    var response = httpPromise.data;
    if (!goog.isObject(response)) {
      return goog.Promise.reject(
          new jsonrpc.Error(jsonrpc.ErrorCode.TRANSPORT_ERROR));
    } else {
      return response;
    }
  });
};





