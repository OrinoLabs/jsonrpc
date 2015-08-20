// Copyright 2015 Michael Bürge <mib@orino.ch>
// All right reserved.


goog.provide('jsonrpc.XdmTransport');


/**
 * @param {xdm.Link} link
 * @param {string} port
 * @constructor
 * @implements {jsonrpc.Transport}
 */
jsonrpc.XdmTransport = function(link, port) {
  /**
   * @type {xdm.Link}
   * @private
   */
  this.link_ = link;

  /** 
   * @type {string}
   * @private
   */
  this.port_ = port;

  /**
   * @type {Object.<string, Object>}
   * @private
   */
  this.pending_ = {};

  this.link_.addHandler(this.port_, this.handleMessage_.bind(this));
};


/**
 * @typedef {{
 *   resolve: function(Object),
 *   reject: function(*)
 * }}
 */
jsonrpc.XdmTransport.PendingCall;


/**
 * @inheritDoc
 */
jsonrpc.XdmTransport.prototype.performCall = function(
    callId, method, opt_params, opt_opts) {
  var msg = {
    'id': callId,
    'method': method,
    'params': opt_params,
    'opts': opt_opts
  };
  return new goog.Promise(function(resolve, reject) {
      this.pending_[callId] = {
        resolve: resolve,
        reject: reject
      };
      this.link_.send(msg);
    }.bind(this));
};


/**
 * @param {Object} response
 * @private
 */
jsonrpc.XdmTransport.prototype.handleMessage_ = function(response) {

};

