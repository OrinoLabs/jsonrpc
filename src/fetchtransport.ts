
import { CallOptions } from './client.js';
import { Transport } from './transport.js';


export interface FetchTransportOptions {
  url?: string;
}


const defaultOpts: FetchTransportOptions = {
  url: '/jsonrpc',
}


export class FetchTransport implements Transport {

  private opts: FetchTransportOptions;


  constructor(opts?: FetchTransportOptions) {
    this.opts = Object.assign({}, defaultOpts, opts);
  }


  performCall(
    callId: string,
    method: string,
    params: object
  ): Promise<object> {

    const bodyData = {
      id: callId,
      method: method,
      params: params,
    };

    return window.fetch(
        this.opts.url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(bodyData),
        })
      .then((response: Response) => {
        return response.json();
      })
      .then((jsonRpcResult: object) => {
        return jsonRpcResult;
      });
  }

}
