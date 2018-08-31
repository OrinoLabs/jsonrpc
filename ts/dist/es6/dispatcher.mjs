import { JsonRpcError, ErrorCode } from './jsonrpcerror.js';
export class Dispatcher {
    constructor() {
        this.handlers = {};
    }
    setCatchAllHandler(handler) {
        this.catchAllHandler = handler;
    }
    addMethod(name, handler) {
        this.handlers[name] = handler;
    }
    dispatchCall(methodName, params) {
        return new Promise((resolve, reject) => {
            var handler = this.handlers[methodName];
            if (!handler && this.catchAllHandler) {
                handler = () => this.catchAllHandler(methodName, params);
            }
            if (!handler) {
                console.error('jsonrpc: No handler for method "' + methodName + '".');
                reject(new JsonRpcError(ErrorCode.METHOD_NOT_FOUND, undefined, methodName));
                return;
            }
            let resultPromise;
            try {
                let handlerReturnValue = handler(params);
                // Did the handler return a promise?
                if (handlerReturnValue instanceof Promise) {
                    resultPromise = handlerReturnValue;
                }
                else {
                    resultPromise = Promise.resolve(handlerReturnValue);
                }
            }
            catch (err) {
                resultPromise = Promise.reject(err);
            }
            resultPromise
                .then(resolve)
                .catch((err) => {
                var msg = 'jsonprc: Call to "' + methodName + '" failed: ';
                console.error(msg, err);
                if (err instanceof JsonRpcError) {
                    reject(err);
                }
                else {
                    reject(new JsonRpcError(ErrorCode.APPLICATION_ERROR, undefined, err));
                }
            });
        });
    }
    ;
}
