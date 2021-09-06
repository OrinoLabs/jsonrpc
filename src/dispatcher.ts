
import { JsonRpcError, ErrorCode } from './jsonrpcerror.js';


type ResultType = boolean|number|string|object
type ResultPromise = Promise<ResultType>
type MethodHandler = (params: object) => ResultPromise; 
type CatchAllHandler = (methodName: string, params: object) => ResultPromise;



export class Dispatcher {

  private handlers: {[name:string]: MethodHandler};

  private catchAllHandler?: CatchAllHandler;

  constructor() {
    this.handlers = {};
  }


  setCatchAllHandler(handler: CatchAllHandler) {
    this.catchAllHandler = handler;
  }


  addMethod(name: string, handler: MethodHandler) {
    this.handlers[name] = handler;
  }


  dispatchCall(methodName: string, params: object): ResultPromise {
    return new Promise<ResultType>((resolve, reject) => {
      var handler = this.handlers[methodName];

      if (!handler && this.catchAllHandler) {
        handler = () => this.catchAllHandler!(methodName, params);
      }

      if (!handler) {
        console.error('jsonrpc: No handler for method "' + methodName + '".');
        reject(new JsonRpcError(
            ErrorCode.METHOD_NOT_FOUND, undefined, methodName));
        return;
      }

      let resultPromise;
      try {
        let handlerReturnValue = handler(params);
        // Did the handler return a promise?
        if (handlerReturnValue instanceof Promise) {
          resultPromise = handlerReturnValue;
        } else {
          resultPromise = Promise.resolve(handlerReturnValue);
        }
      } catch (err) {
        resultPromise = Promise.reject(err);
      }

      resultPromise
        .then(resolve)
        .catch((err) => {
          var msg = 'jsonprc: Call to "' + methodName + '" failed: ';
          console.error(msg, err);
          if (err instanceof JsonRpcError) {
            reject(err);
          } else {
            reject(new JsonRpcError(
                ErrorCode.APPLICATION_ERROR, undefined, err));
          }
        })
    });
  };

}