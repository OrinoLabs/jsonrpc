

var gulp = require('gulp');
var Q = require('q');
var spawn = require('child_process').spawn;


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



function runJsUnitTests() {
  var resolver = Q.defer();

  var numFailed = undefined;

  var proc = spawn(
      'node_modules/closure-library-phantomjs/bin/closure-library-phantomjs',
      [ '-r', 'tap',  // Output format.
        'all_tests.html' ]);

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

gulp.task('run-jsunit-tests', runJsUnitTests);




