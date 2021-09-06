// TODO: Have JsonRpcError extend the native Error class.
// Possibly useful:
// https://www.npmjs.com/package/ts-error
/**
 * http://xmlrpc-epi.sourceforge.net/specs/rfc.fault_codes.php
 */
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["PARSE_ERROR"] = -32700] = "PARSE_ERROR";
    ErrorCode[ErrorCode["INVALID_REQUEST"] = -32600] = "INVALID_REQUEST";
    ErrorCode[ErrorCode["METHOD_NOT_FOUND"] = -32601] = "METHOD_NOT_FOUND";
    ErrorCode[ErrorCode["INVALID_PARAMS"] = -32602] = "INVALID_PARAMS";
    ErrorCode[ErrorCode["INTERNAL_ERROR"] = -32603] = "INTERNAL_ERROR";
    ErrorCode[ErrorCode["TRANSPORT_ERROR"] = -32300] = "TRANSPORT_ERROR";
    ErrorCode[ErrorCode["APPLICATION_ERROR"] = -32000] = "APPLICATION_ERROR";
})(ErrorCode || (ErrorCode = {}));
let errorMessages = {
    [ErrorCode.PARSE_ERROR]: 'Parse error.',
    [ErrorCode.INVALID_REQUEST]: 'Invalid request.',
    [ErrorCode.METHOD_NOT_FOUND]: 'Method not found.',
    [ErrorCode.INVALID_PARAMS]: 'Invalid params.',
    [ErrorCode.INTERNAL_ERROR]: 'Internal error.',
    [ErrorCode.TRANSPORT_ERROR]: 'Transport error.',
    [ErrorCode.APPLICATION_ERROR]: 'Application error.',
};
export class JsonRpcError {
    constructor(code, msg, data) {
        this.code = code;
        this.message = msg || errorMessages[code] || '';
        this.data = data;
    }
    static fromJson(jsonError) {
        return new JsonRpcError(jsonError.code, jsonError.message, jsonError.data);
    }
    /**
     * NOTE: No need to actually do something. The JSON.stringify() handles
     * jsonrpc.Error-instances just fine.
     * This is left here to illustrate that jsonrpc.Error-instances end up being
     * passed JSON.stringify().
     */
    toJSON() {
        return this;
    }
    toString() {
        return 'JsonRpcError: ' + this.message;
    }
}
