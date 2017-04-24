

goog.provide('jsonrpc.AngularTransport');

goog.require('jsonrpc.Transport');



/**
 * @param {Http} ngHttp
 * @param {string=} opt_endpointPath
 * @constructor
 * @implements {jsonrpc.Transport}
 */
jsonrpc.AngularTransport = function(ngHttp, opt_endpointPath) {
  /**
   * @type {Http}
   * @private
   */
  this.ngHttp_ = ngHttp;

  /**
   * @type {string}
   * @private
   */
  this.endpointPath_ = opt_endpointPath || '/jsonrpc';
};


/** @inheritDoc */
jsonrpc.AngularTransport.prototype.performCall = function(callId, method, params) {
  return new Promise(function(resolve, reject) {
    var body = JSON.stringify(
        {'id': callId, 'method': method, 'params': params});
    /** @type {RequestOptionsArgs} */
    var opts = {
      'headers': ['Content-Type: application/json; charset=utf-8]'],
    };
    this.ngHttp_
      .post(this.endpointPath_, body)
      .subscribe((res) => {
        console.log(res);
      });
  }.bind(this));
};
