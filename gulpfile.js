

var gulp = require('gulp');
var path = require('path');
var Q = require('q');
var spawn = require('child_process').spawn;


var CLOSURE_LIB = 'node_modules/google-closure-library';
var GOOG_DIR = path.join(CLOSURE_LIB, 'closure/goog');



/**
 * @param {string} prefix
 * @return {function((string|Buffer)):void}
 */
function logWithPrefix(prefix, data) {
  var lines = data.toString().split('\n');
  var last = lines.pop();
  if (last !== '') lines.push(last);
  lines.forEach(
      (line) => { process.stdout.write(`[${prefix}] ${line}\n`) } );
}


// ---------- deps ----------


gulp.task('writedeps', function() {
  function rootWithPrefixArg(root) {
    var rel = path.relative(GOOG_DIR, root);
    return `--root_with_prefix=${root} ${rel}`;
  }
  return Q.Promise((resolve, reject) => {
    var proc = spawn(
        CLOSURE_LIB + '/closure/bin/build/depswriter.py',
        [ rootWithPrefixArg('src'),
          '--output_file=deps.js' ]);
    proc.stdout.on('data', logWithPrefix.bind(null, 'depswriter.py'));
    proc.stderr.on('data', logWithPrefix.bind(null, 'depswriter.py stderr'));
    proc.on('exit', (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error('depswriter.py failed'));
    })
  })
});


// ---------- JsUnit tests ----------



/**
 * @param {child_process.ChildProcess}
 * @return {Promise}
 */
function killProcess(proc) {
  if (!proc) return Q();

  var timers = [];
  return Q.Promise((resolve, reject, notify) => {
      proc.on('exit', resolve);
      proc.on('error', reject);
      proc.kill('SIGTERM');

      // Kill it some more after a while.
      timers.push(setTimeout(
          () => {
            console.log('Send SIGKILL.')
            proc.kill('SIGKILL');
          },
          10000));
      // Give it some more time, then just reject the promise.
      timers.push(setTimeout(() => reject(), 15000));
    })
    .finally(() => timers.forEach(clearTimeout));
}



function withExpressServer(fn) {
  var proc = spawn('node', ['testing/express-server.js']);
  fn()
  .then(function() {
    proc.kill('SIGTERM');
  });
}



function runJsUnitTests() {
  var resolver = Q.defer();

  var numFailed = undefined;

  var proc = spawn(
      'node_modules/closure-library-phantomjs/bin/closure-library-phantomjs',
      [ '-r', 'tap',  // Output format.
        'http://localhost:9090/all_tests.html' ]);

  proc.stdout.on('data', (data) => {
    logWithPrefix('runner stdout', data);
    var matches = data.toString().match(/# fail (\d*)/);
    if (matches) {
      numFailed = parseInt(matches[1], 10);
    }
  });
  proc.stderr.on('data', logWithPrefix.bind(null, 'runner stderr'));
  proc.on('exit', (code, signal) => {
    if (code === 0 && numFailed === 0) {
      resolver.resolve();
    } else {
      if (signal) console.log('runner exited on signal: ' + signal);
      // NOTE/GOTCHA: gulp still exits with code 0 if a task promise
      // is rejected with undefined (when calling reject() without arg).
      resolver.reject(new Error('# failed JsUnit tests: ' + numFailed));
    }
  })

  return resolver.promise;
}


gulp.task('run-jsunit-tests', function() {
  return withExpressServer(runJsUnitTests);
});




