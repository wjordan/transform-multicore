/**
 * Multicore transform stream processing library
 */

module.exports = function (moduleName, options) {
  options = options || {};

  var format = null;
  var concurrency = options.concurrency || require('os').cpus().length;

  function process(data, callback) {
    var inputData = data;
    if(typeof options.input == 'function') {
      inputData = options.input(data);
    }
    if (!format) {
      var temp = require('temp').openSync();
      var fs = require('fs');
      fs.writeSync(temp.fd, "require('" + __dirname + "/node_modules/slave/slave')(require('" + require.resolve(moduleName) + "'));");
      format = require('slave/master')(require.resolve(temp.path));
      for (var i = 0; i < concurrency; i++) {
        format.fork();
      }
    }
    format(inputData).then(function (outputData) {
      if(typeof options.output == 'function') {
        outputData = options.output(data, inputData, outputData);
      }
      return callback(null, outputData);
    });
  }

  var stream = require('parallel-transform')(options.maxParallel || 16, process);
  stream.on('end', function () {
    if (format) {
      format.kill();
      format = null;
    }
  });
  return stream;
};
