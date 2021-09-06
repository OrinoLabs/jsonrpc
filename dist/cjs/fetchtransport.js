"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchTransport = void 0;
const defaultOpts = {
    url: '/jsonrpc',
};
class FetchTransport {
    constructor(opts) {
        this.opts = Object.assign({}, defaultOpts, opts);
    }
    performCall(callId, method, params) {
        const bodyData = {
            id: callId,
            method: method,
            params: params,
        };
        return window.fetch(this.opts.url, {
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
