

// TODO: Have JsonRpcError extend the native Error class.
// Possibly useful:
// https://www.npmjs.com/package/ts-error


/**
 * http://xmlrpc-epi.sourceforge.net/specs/rfc.fault_codes.php
 */
export enum ErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  TRANSPORT_ERROR = -32300,

  APPLICATION_ERROR = -32000,
}


let errorMessages: {[key:string]: string} = {
  [ErrorCode.PARSE_ERROR]: 'Parse error.',
  [ErrorCode.INVALID_REQUEST]: 'Invalid request.',
  [ErrorCode.METHOD_NOT_FOUND]: 'Method not found.',
  [ErrorCode.INVALID_PARAMS]: 'Invalid params.',
  [ErrorCode.INTERNAL_ERROR]: 'Internal error.',
  [ErrorCode.TRANSPORT_ERROR]: 'Transport error.',
  [ErrorCode.APPLICATION_ERROR]: 'Application error.',
}



export class JsonRpcError {

  public code: number;
  public message: string;
  public data: any;


  constructor(code: ErrorCode, msg?: string, data?: any) {
    this.code = code;
    this.message = msg || errorMessages[code] || '';
    this.data = data;
  }


  static fromJson(jsonError: object): JsonRpcError {
    return new JsonRpcError(
        jsonError['code'], jsonError['message'], jsonError['data']);
  }


  /**
   * NOTE: No need to actually do something. The JSON.stringify() handles
   * jsonrpc.Error-instances just fine.
   * This is left here to illustrate that jsonrpc.Error-instances end up being
   * passed JSON.stringify().
   */
  toJSON(): object {
    return this;
  }


  toString(): string {
    return 'JsonRpcError: ' + this.message;
  }

}

