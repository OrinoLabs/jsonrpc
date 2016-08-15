

goog.provide('jsonrpc.XdmHandler');


/**
 * @param {xdm.Link} link
 * @param {string} port
 * @param {jsonrpc.Client} jsonrpcClient
 * @constructor
 */
jsonrpc.XdmHandler = function(link, port, jsonrpcClient) {
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
   * @type {jsonrpc.Client}
   * @private
   */
  this.jsonrpcClient_ = jsonrpcClient

  this.link_.addPort(this.port_, this.handleMessage_.bind(this));
};


/**
 * @param {*} msg
 * @private
 */
jsonrpc.XdmHandler.prototype.handleMessage_ = function(msg) {
  var callId = msg['id'];
  var method = msg['method'];
  var params = msg['params'];
  var opts = msg['opts'];

  this.jsonrpcClient_.call(method, params, opts)
  .then(function(result) {
    this.link_.send(this.port_, {'id': callId, 'result': result});
  }.bind(this))
  .then(null, function(err) {
    this.link_.send(this.port_, {'id': callId, 'error': err});
  }.bind(this));
};


