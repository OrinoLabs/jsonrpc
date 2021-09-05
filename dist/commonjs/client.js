"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonrpcerror_js_1 = require("./jsonrpcerror.js");
class Client {
    constructor(transport) {
        this.callIdPrefix = Math.floor(Math.random() * Math.pow(36, 4)).toString(36) + '-';
        this.callCount = 0;
        this.transport = transport;
    }
    generateCallId() {
        this.callCount++;
        return this.callIdPrefix + this.callCount;
    }
    call(method, params, opts) {
        if (!opts)
            opts = {};
        let maxAttempts = opts.maxAttempts || 1;
        let attempt = 0;
        return new Promise((resolve, reject) => {
            let attemptCall = () => {
                attempt += 1;
                this.performCall(method, params, opts)
                    .then(resolve)
                    .catch((err) => {
                    if (attempt === maxAttempts) {
                        reject(err);
                    }
                    else if (opts.shouldRetry && !opts.shouldRetry(err)) {
                        reject(err);
                    }
                    else {
                        attemptCall();
                    }
                });
            };
            attemptCall();
        });
    }
    performCall(method, params, opts) {
        // var callId = (opt_opts && opt_opts.callId) || jsonrpc.Client.generateCallId();
        const callId = this.generateCallId();
        if (!params)
            params = {};
        return this.transport.performCall(callId, method, params)
            .then((response) => {
            var result = response['result'];
            var error = response['error'];
            if (result) {
                return Promise.resolve(result);
            }
            else if (error) {
                // Allow strings as errors. This is slightly more permissive than the
                // JSONRPC specification, which mandates an error object.
                if (typeof error === 'string') {
                    return Promise.reject(new jsonrpcerror_js_1.JsonRpcError(jsonrpcerror_js_1.ErrorCode.APPLICATION_ERROR, error));
                }
                else {
                    return Promise.reject(jsonrpcerror_js_1.JsonRpcError.fromJson(error));
                }
            }
            else {
                // TODO: Maybe introduce a separate error code for this.
                return Promise.reject(new jsonrpcerror_js_1.JsonRpcError(jsonrpcerror_js_1.ErrorCode.INTERNAL_ERROR, 'Internal error: Malformed response received from transport.'));
            }
        })
            .catch((error) => {
            return Promise.reject(error);
        });
    }
}
exports.Client = Client;
