"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FetchTransport {
    constructor() { }
    performCall(callId, method, params) {
        let bodyData = {
            id: callId,
            method: method,
            params: params,
        };
        return window.fetch('/jsonrpc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(bodyData),
        })
            .then((response) => {
            return response.json();
        })
            .then((jsonRpcResult) => {
            return jsonRpcResult;
        });
    }
}
exports.FetchTransport = FetchTransport;
