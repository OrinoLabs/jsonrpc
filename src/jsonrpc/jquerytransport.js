// Copyright 2015 Michael Bürge <mib@orino.ch>
// All rights reserved.


goog.provide('jsonrpc.JqueryTransport');

goog.require('goog.Promise');
goog.require('jsonrpc.Error');
goog.require('jsonrpc.Transport');


if (typeof jQuery == 'undefined') {
  throw new Error('jQuery library not present.');
}


/**
 * @param {string} opt_endpointPath
 * @constructor
 * @implements {jsonrpc.Transport}
 */
jsonrpc.JqueryTransport = function(opt_endpointPath) {
  if (opt_endpointPath) {
    this.endpointPath = opt_endpointPath;
  }
};


/**
 * @type {string}
 */
jsonrpc.JqueryTransport.prototype.endpointPath = '/jsonrpc';


/**
 * @inheritDoc
 */
jsonrpc.JqueryTransport.prototype.performCall = function(method, opt_params) {
  var reqOpts = {
    url: this.endpointPath,
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify({
      'method': method,
      'params': opt_params,
    })
  };
  return new goog.Promise(function(resolve, reject) {
    jQuery.ajax(reqOpts)
    .done(function(responseObj, textStatus, jqxhr) {
      resolve(responseObj);
    })
    .fail(function(jqxhr, textStatus, errorThrown) {
      reject(new jsonrpc.Error(
          jsonrpc.ErrorCode.TRANSPORT_ERROR, undefined, errorThrown));
    });
  });
};

