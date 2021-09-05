"use strict";
// Copyright 2015 Michael Bürge <mib@orino.ch>
// All rights reserved.
Object.defineProperty(exports, "__esModule", { value: true });
const jsonrpcerror_1 = require("./jsonrpcerror");
function createHandler(dispatcher, logError) {
    return function (httpRequest, httpResponse) {
        function sendResponse(jsonrpcResponse) {
            httpResponse.setHeader('Content-Type', 'application/json; charset=utf-8');
            httpResponse.write(JSON.stringify(jsonrpcResponse));
            httpResponse.end();
        }
        function replyWithResult(result) {
            sendResponse({ 'id': callId, 'result': result });
        }
        function replyWithError(error) {
            sendResponse({ 'id': callId, 'error': error });
            logError && logError(httpRequest, httpResponse, error);
        }
        var requestData = httpRequest.body;
        if (typeof requestData == 'string') {
            try {
                requestData = JSON.parse(requestData);
            }
            catch (err) {
                replyWithError(new jsonrpcerror_1.JsonRpcError(jsonrpcerror_1.ErrorCode.PARSE_ERROR));
                return;
            }
        }
        else if (typeof requestData == 'object') {
            // Nothing to do.
            // With the body-parser middleware in place and the appropriate
            // content-type (application/json), the JSON parsing will already have
            // been taken care of.
        }
        else {
            replyWithError(new jsonrpcerror_1.JsonRpcError(jsonrpcerror_1.ErrorCode.INTERNAL_ERROR));
            return;
        }
        var methodName = requestData['method'];
        var params = requestData['params'] || {};
        var callId = requestData['id'];
        if (!methodName) {
            replyWithError(new jsonrpcerror_1.JsonRpcError(jsonrpcerror_1.ErrorCode.INVALID_REQUEST));
            return;
        }
        dispatcher.dispatchCall(methodName, params)
            .then(replyWithResult)
            .catch(replyWithError);
    };
}
exports.createHandler = createHandler;
