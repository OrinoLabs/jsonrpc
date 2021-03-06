// Copyright 2015 Michael Bürge <mib@orino.ch>
// All rights reserved.


goog.provide('jsonrpc.serve.express');


/**
 * @param {jsonrpc.Dispatcher} dispatcher
 * @param {function(express.Request, express.Response, jsonrpc.Error)=} opt_logError
 * @return {function(express.Request, express.Response)}
 */
jsonrpc.serve.express.createHandler = function(dispatcher, opt_logError) {
  
  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  var handlerFunction = function(httpRequest, httpResponse) {

    /** @param {Object} jsonrpcResponse */
    function sendResponse(jsonrpcResponse) {
      httpResponse.setHeader('Content-Type', 'application/json; charset=utf-8');
      httpResponse.write(JSON.stringify(jsonrpcResponse));
      httpResponse.end();
    }
    /** @param {*} result */
    function replyWithResult(result) {
      sendResponse({'id': callId, 'result': result});
    }
    /** @param {jsonrpc.Error} error */
    function replyWithError(error) {
      sendResponse({'id': callId, 'error': error});
      opt_logError && opt_logError(httpRequest, httpResponse, error);
    }


    var requestData = httpRequest.body;

    if (typeof requestData == 'string') {
      try {
        requestData = JSON.parse(requestData);
      } catch (err) {
        replyWithError(new jsonrpc.Error(jsonrpc.ErrorCode.PARSE_ERROR));
        return;
      }
    } else if (typeof requestData == 'object') {
      // Nothing to do.
      // With the body-parser middleware in place and the appropriate
      // content-type (application/json), the JSON parsing will already have
      // been taken care of.
    } else {
      replyWithError(new jsonrpc.Error(jsonrpc.ErrorCode.INTERNAL_ERROR));
      return;
    }

    var methodName = requestData['method'];
    var params = requestData['params'] || {};
    var callId = requestData['id'];

    if (!methodName) {
      replyWithError(new jsonrpc.Error(jsonrpc.ErrorCode.INVALID_REQUEST));
      return;
    }

    dispatcher.dispatchCall(methodName, params)
    .then(replyWithResult, replyWithError);
  };

  return handlerFunction;
};


