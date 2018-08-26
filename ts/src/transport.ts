
import { CallOptions } from './client.js';


export interface Transport {
  performCall(
      callId: string,
      method: string,
      params: object)
      : Promise<object>;
}
