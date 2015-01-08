/**
 * Multicore transform stream processing library
 */

module.exports = function (moduleName, options) {
  options = options || {};

  var format = null;
  var concurrency = options.concurrency || require('os').cpus().length;

  function process(data, callback) {
    if (!format) {
      var temp = require('temp').openSync();
      var fs = require('fs');
      fs.writeSync(temp.fd, "require('" + __dirname + "/node_modules/slave/slave')(require('" + require.resolve(moduleName) + "'));");
      format = require('slave/master')(require.resolve(temp.path));
      for (var i = 0; i < concurrency; i++) {
        format.fork();
      }
    }
    format(data).then(function (data) {
      return callback(null, data);
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
