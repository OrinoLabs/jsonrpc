
import { CallOptions } from './client.js';
import { Transport } from './transport.js';


export class FetchTransport implements Transport {

  constructor() {}

  performCall(
      callId: string,
      method: string,
      params: object)
      : Promise<object>
  {
    let bodyData = {
      id: callId,
      method: method,
      params: params,
    };

    return window.fetch(
        '/jsonrpc',
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
