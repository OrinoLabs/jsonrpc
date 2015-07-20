// Copyright 2015 Michael Bürge. All rights reserved.


goog.provide('jsonrpc.AngularTransport');

goog.require('jsonrpc.Transport');


// TODO:
// - Error handling



jsonrpc.ngModule = (function() {
  if (typeof angular == 'undefined') {
    throw new Error('Angular library is not present.');
  }
  return angular.module('jsonrpc', []);
})();


/**
 * Acquires the angular $http service.
 * @ngInject
 */
jsonrpc.acquireHttpService = function($http) {
  jsonrpc.$http = $http;
}
jsonrpc.ngModule.run(jsonrpc.acquireHttpService);


/**
 * @constructor
 * @implements {jsonrpc.Transport}
 */
jsonrpc.AngularTransport = function() {};
goog.inherits(jsonrpc.AngularTransport, jsonrpc.Transport);


/**
 * @inheritDoc
 */
jsonrpc.AngularTransport.prototype.performCall = function(method, opt_params) {
  var payload = {
    method: method,
    params: opt_params || {}
  }
  return jsonrpc.$http({
    method: 'POST',
    url: '/jsonrpc',
    data: JSON.stringify(payload)
  })
  .then(function(httpPromise) {
    var response = httpPromise.data;
    if (!goog.isObject(response)) {
      return goog.Promise.reject(
          new jsonrpc.Error(jsonrpc.ErrorCode.TRANSPORT_ERROR));
    } else {
      return response;
    }
  });
};





