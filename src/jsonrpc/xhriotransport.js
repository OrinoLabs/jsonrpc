// Copyright 2015 Michael Bürge. All rights reserved.


/**
 * @fileoverview Perform JSON-RPC calls using goog.net.XhrIo.
 *
 * NOTE:
 * Differs from the JSON-RPC spec in that data is sent as form data,
 * not directly as JSON in the HTTP body.
 * TODO: Change this.
 */


goog.provide('jsonrpc.XhrIoTransport');
// TODO: Stop using this directly.
goog.provide('jsonrpc.JsonRpcIo');

goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.EventType')
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');
goog.require('jsonrpc.Transport');



/**
 * @constructor
 * @implements {jsonrpc.Transport}
 */
jsonrpc.XhrIoTransport = function() {};


/**
 * @inheritDoc
 */
jsonrpc.XhrIoTransport.prototype.performCall = function(method, opt_params) {
  return new goog.Promise(function(resolve, reject) {
    var rpcIo = new jsonrpc.JsonRpcIo(method)
    if (opt_params) {
      rpcIo.setParameters(opt_params);
    }
    rpcIo.listen(
        goog.net.EventType.COMPLETE,
        function(e) {
          if (e.result) {
            resolve(e.result);
          } else {
            reject(e.error);
          }
        });
    rpcIo.send();
  });
};


/**
 * @param {string} methodName The JSON-RPC method name.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
jsonrpc.JsonRpcIo = function(methodName) {
  goog.events.EventTarget.call(this);

  /**
   * @type {string}
   * @protected
   */
  this.methodName_ = methodName;

  /**
   * @type {Object.<string, (string,number,Object)>}
   * @protected
   */
  this.params_ = {};
};
goog.inherits(jsonrpc.JsonRpcIo, goog.events.EventTarget);


/**
 * @enum {number}
 */
jsonrpc.JsonRpcIo.CompletionStatus = {
  OK: 1,
  APPLICATION_ERROR: 2,
  XHRIO_ERROR: 3
};


/**
 * The default path.
 * @type {string}
 */
jsonrpc.JsonRpcIo.DEFAULT_PATH = '/jsonrpc';


/**
 * Whether paramters are to be JSON-encoded and sent as single URL parameter
 * ('params').
 * If false, parameters are added as individual URL parameters. In that case,
 * beware of conflicts with reserved URL parameters (such as 'method').
 * @type {boolean}
 */
jsonrpc.JsonRpcIo.prototype.jsonEncodedParams = true;


/**
 * @type {string}
 */
jsonrpc.JsonRpcIo.prototype.httpMethod = 'POST';



/**
 * @type {goog.net.XhrIo}
 * @private
 */
jsonrpc.JsonRpcIo.prototype.xhrIo_; 


/**
 * Sets a parameter value.
 * @param {string} name The parameter name.
 * @param {(string|number|Object)} value The parameter value.
 */
jsonrpc.JsonRpcIo.prototype.setParameterValue = function(name, value) {
  this.params_[name] = value;
};


/**
 * @param {string} name The parameter name.
 * @return {(string|number|Object)} The parameter value.
 */
jsonrpc.JsonRpcIo.prototype.getParameterValue = function(name) {
  return this.params_[name];
};


/**
 * Sets multiple parameters.
 * @param {Object.<string,(string|number)>} params
 */
jsonrpc.JsonRpcIo.prototype.setParameters = function(params) {
  for (var name in params) {
    this.setParameterValue(name, params[name]);
  }
};


/**
 * Returns the Uri instance for a call.
 * @return {goog.Uri}
 * @private
 */
jsonrpc.JsonRpcIo.prototype.buildUri_ = function() {
  var uri = new goog.Uri(jsonrpc.JsonRpcIo.DEFAULT_PATH);

  uri.setParameterValue('method', this.methodName_);

  if (this.httpMethod == 'GET') {
    if (this.jsonEncodedParams) {
      var paramsJson = goog.json.serialize(this.params_);
      uri.setParameterValue('params', paramsJson);
      
    } else {
      for (var name in this.params_) {
        uri.setParameterValue(name, this.params_[name]);
      }
    }
  }

  return uri;
};


/**
 * @return {(undefined|FormData)}
 * @private
 */
jsonrpc.JsonRpcIo.prototype.buildBody_ = function() {
  if (this.httpMethod == 'GET') {
    return undefined;

  } else if (this.httpMethod == 'POST') {
    var formData = new FormData;
    formData.append('method', this.methodName_);
    formData.append('params', goog.json.serialize(this.params_));
    return formData;
  }
};


/**
 * @private
 */
jsonrpc.JsonRpcIo.prototype.getHeaders_ = function() {
  var headers = {};
  return headers;
}


/**
 * Sends a request.
 */
jsonrpc.JsonRpcIo.prototype.send = function() {
  if (this.xhrIo_) {
    throw 'JsonRpcIo#send: Called repeatedly.';
  }

  this.xhrIo_ = new goog.net.XhrIo;
  this.xhrIo_.listen(goog.net.EventType.COMPLETE,
                     goog.bind(this.handleCompletion_, this));
  this.xhrIo_.listen(goog.net.EventType.ERROR,
                     goog.bind(this.handleError_, this));

  var uri = this.buildUri_();
  var body = this.buildBody_();
  var headers = this.getHeaders_();
  this.xhrIo_.send(uri, this.httpMethod, body, headers);
};


/**
 * Handles completion events from the XhrIo instance.
 */
jsonrpc.JsonRpcIo.prototype.handleCompletion_ = function() {
  // A COMPLETE event is stil fired even if an error occurred.
  if (!this.xhrIo_.isSuccess()) {
    return;
  }

  try {
    var response = this.xhrIo_.getResponseJson();
  } catch (e) {
    this.dispatchEvent({
        type: jsonrpc.JsonRpcIo.CompletionStatus.APPLICATION_ERROR,
        error: 'Invalid JSON.',
        jsonRpcIo: this
      });
    return;
  }

  var e = {
    type: goog.net.EventType.COMPLETE
  };

  var result = response['result'];
  var error = response['error'];

  if (goog.isDef(result)) {
    e.status = jsonrpc.JsonRpcIo.CompletionStatus.OK;
    e.result = result;

  } else {
    if (!error) {
      error = 'Unspecified error.'
    }
    e.status = jsonrpc.JsonRpcIo.CompletionStatus.APPLICATION_ERROR;
    e.error = error;
  }

  this.dispatchEvent(e);
};


/**
 * Handles error events from the XhrIo instance.
 */
jsonrpc.JsonRpcIo.prototype.handleError_ = function() {
  this.dispatchEvent({
      type: goog.net.EventType.COMPLETE,
      status: jsonrpc.JsonRpcIo.CompletionStatus.XHRIO_ERROR,
      error: 'XhrIo error: ' + this.xhrIo_.getLastError()
    });
};


