// Copyright 2015 Michael Bürge <mib@orino.ch>
// All right reserved.


goog.provide('jsonrpc.XdmTransport');

goog.require('goog.log');


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

  this.link_.addPort(this.port_, this.handleMessage_.bind(this));
};


/** @type {goog.debug.Logger} */
jsonrpc.XdmTransport.logger = jsonrpc.XdmTransport.prototype.logger =
    goog.log.getLogger('xdm.XdmTransport');


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
      this.link_.send(this.port_, msg);
    }.bind(this));
};


/**
 * @param {Object} response
 * @private
 */
jsonrpc.XdmTransport.prototype.handleMessage_ = function(response) {
  var callId = response['id'];
  var pending = this.pending_[callId];
  if (pending) {
    pending.resolve(response);
  } else {
    this.logger.info('No pending call with id "' + callId + '".');
  }
};

