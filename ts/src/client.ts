
import { JsonRpcError, ErrorCode } from './jsonrpcerror.js';
import { Transport } from './transport.js';


export interface CallOptions {
  maxAttempts?: number;
  shouldRetry?: (JsonRpcError) => boolean;
}


export class Client {

  private transport: Transport;

  private callIdPrefix: string =
      Math.floor(Math.random() * Math.pow(36, 4)).toString(36) + '-';
  private callCount: number = 0;



  constructor(transport: Transport) {
    this.transport = transport;
  }


  private generateCallId(): string {
    this.callCount++;
    return this.callIdPrefix + this.callCount;
  }


  public call(method: string, params?: object, opts?: CallOptions): Promise<object> {
    if (!opts) opts = {};

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
          } else if (opts.shouldRetry && !opts.shouldRetry(err)) {
            reject(err);
          } else {
            attemptCall();
          }
        });
      };

      attemptCall();
    });
  }


  private performCall(
      method: string, params?: object, opts?: CallOptions): Promise<object> {

    // var callId = (opt_opts && opt_opts.callId) || jsonrpc.Client.generateCallId();
    const callId = this.generateCallId(); 
    if (!params) params = {};

    return this.transport.performCall(callId, method, params)
      .then((response: object) => {
        var result = response['result'];
        var error = response['error'];
        if (result) {
          return Promise.resolve(result);

        } else if (error) {
          // Allow strings as errors. This is slightly more permissive than the
          // JSONRPC specification, which mandates an error object.
          if (typeof error === 'string') {
            return Promise.reject(
                new JsonRpcError(ErrorCode.APPLICATION_ERROR, error));
          } else {
            return Promise.reject(
                JsonRpcError.fromJson(error));
          }
        } else {
          // TODO: Maybe introduce a separate error code for this.
          return Promise.reject(
              new JsonRpcError(
                  ErrorCode.INTERNAL_ERROR,
                  'Internal error: Malformed response received from transport.'));
        }
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }


}

