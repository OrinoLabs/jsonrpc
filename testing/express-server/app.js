
let Dispatcher = require('../../dist/commonjs/dispatcher.js').Dispatcher;
let createHandler = require('../../dist/commonjs/expresshandler.js').createHandler;

var express = require('express');
var bodyParser = require('body-parser');


var cfg = {
  port: 9090,
};


// ---------- express app ----------

var expressApp = express();

// Parse JSON body payload.
// If the request content type is 'application-json', bodyParser will parse
// the submitted JSON and put it in the body property of the request object.
expressApp.use(bodyParser.json());


// ---------- dispatcher ----------

var dispatcher = new Dispatcher;

dispatcher.addMethod('echo', function(params) {
  console.log('echo: ' + JSON.stringify(params));
  return params;
});


// ---------- routes ----------

// Add JSON-RPC endpoint to express routes.
var jsonrpcHandler = createHandler(dispatcher);
expressApp.post('/jsonrpc', jsonrpcHandler);


// Static content. Serve the whole project directory.
expressApp.use(express.static(__dirname + '/../..'));


// ---------- start serving ----------

try {
  expressApp.listen(cfg.port);
  console.log('Listening on port ' + cfg.port);
} catch (e) {
  console.error('Failed to start server: ', e);
}
