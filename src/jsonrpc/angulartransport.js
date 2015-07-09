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

// Acquire the angular $http service.
jsonrpc.ngModule.run(function($http) {
  jsonrpc.$http = $http;
})


/**
 * @extends {jsonrpc.Transport}
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
    if (response['result']) {
      return response['result'];
    } else {
      throw new Error('NO GOOD!');
    }
  });
};





