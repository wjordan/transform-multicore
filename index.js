/**
 * Multicore transform stream processing library.
 * function(string, options)
 */

var pluginName = 'default';
var PluginError = require('gulp-util/lib/PluginError');

function createError(file, err) {
	if (typeof err === 'string') {
		return new PluginError(pluginName, file.path + ': ' + err, {
			fileName: file.path,
			showStack: false
		});
	}

	var msg = err.message || err.msg || 'unspecified error';

	return new PluginError(pluginName, file.path + ': ' + msg, {
		fileName: file.path,
		lineNumber: err.line,
		stack: err.stack,
		showStack: false
	});
}

module.exports = function (moduleName) {
	return function(options, concurrency) {
		pluginName = moduleName;
		options = options || {};

		var format = null;
		var forks = 0;
		concurrency = concurrency || Math.max(1,require('os').cpus().length - 1);

		function process(data, callback) {
			try {
				if(!format) {
					var tmp = require('tmp');
					var fs = require('fs');
					tmp.file(function _tempFileCreated(err, path, fd, cleanupCallback) {
						if (err) throw err;
						fs.write(fd, "require('" + __dirname + "/node_modules/slave/slave')(require('" + require.resolve(moduleName) + "'));");
						format = require('slave/master')(require.resolve(path));
						nextStep();
					});
				} else {
					nextStep();
				}

				function nextStep() {
					if(forks < concurrency) {
						format.fork();
						forks++;
					}
					format(data, options).then(function (data) {
						return callback(null, data);
					});
				}
			} catch (e) {
				console.log(e);
				return callback(createError(data, e));
			}
		}

		var stream = require('parallel-transform')(concurrency, process);
		stream.on('end', function() {
			if(format) {
				format.kill();
				format = null;
			}
		});
		return stream;
	}
};
