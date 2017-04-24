

goog.provide('jsonrpc.AngularTransport');

goog.require('jsonrpc.Transport');


// TODO: Figure out how to properly get access to the Headers constructor.
// Currently expecting it to be passed in to the constructor, which is a hack.


/**
 * @param {Http} ngHttp
 * @param {string=} opt_endpointPath
 * @constructor
 * @implements {jsonrpc.Transport}
 */
jsonrpc.AngularTransport = function(ngHttp, ngHeadersCtor, opt_endpointPath) {
  /**
   * @type {Http}
   * @private
   */
  this.ngHttp_ = ngHttp;

  /**
   * @type {function(): Headers}
   * @private
   */
  this.ngHeadersCtor_ = ngHeadersCtor;

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
    var headers = new this.ngHeadersCtor_;
    headers.set('Content-Type', 'application/json; charset=utf-8');
    /** @type {RequestOptionsArgs} */
    var opts = {
      'headers': headers,
    };
    this.ngHttp_
      .post(this.endpointPath_, body, opts)
      .subscribe(
        (res) => {
          var jsonrpcResult = res.json();
          resolve(jsonrpcResult);
        },
        (err) => reject(e));

  }.bind(this));
};
