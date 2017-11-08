

goog.provide('jsonrpc.AngularTransport2');

goog.require('jsonrpc.Transport');
goog.require('jsonrpc.Error');
goog.require('jsonrpc.ErrorCode');


// TODO: Figure out how to properly get access to the HttpHeaders constructor.
// Currently expecting it to be passed in to the constructor, which is a hack.


/**
 * @param {Function} ngHttpClient
 * @param {Function} ngHttpHeadersCtor
 * @param {string=} opt_endpointPath
 * @constructor
 * @implements {jsonrpc.Transport}
 */
jsonrpc.AngularTransport2 = function(ngHttpClient, ngHttpHeadersCtor, opt_endpointPath) {
  /**
   * @type {Http}
   * @private
   */
  this.ngHttpClient_ = ngHttpClient;

  /**
   * @type {function(): Headers}
   * @private
   */
  this.ngHttpHeadersCtor_ = ngHttpHeadersCtor;

  /**
   * @type {string}
   * @private
   */
  this.endpointPath_ = opt_endpointPath || '/jsonrpc';
};


/** @inheritDoc */
jsonrpc.AngularTransport2.prototype.performCall = function(callId, method, params) {
  return new Promise(function(resolve, reject) {
    var body = JSON.stringify(
        {'id': callId, 'method': method, 'params': params});
    var headers = new this.ngHttpHeadersCtor_();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    /** @type {RequestOptionsArgs} */
    var opts = {
      'headers': headers,
      'observe': 'response',
    };
    this.ngHttpClient_
      .post(this.endpointPath_, body, opts)
      .subscribe(
        /** function(Response) */
        (res) => {
          resolve(res.body);
        },
        /** function(Response) */
        (err) => {
          var rpcErr = new jsonrpc.Error(
              jsonrpc.ErrorCode.TRANSPORT_ERROR, undefined, err);
          reject(rpcErr);
        });

  }.bind(this));
};
