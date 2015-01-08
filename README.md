# transform-multicore
Transform-stream wrapper that parallelizes data across multiple child processes to maximize usage on multi-core CPUs.

## Install

`npm install --save transform-multicore`

## Syntax

multicore(modulePath, options)

test.js:
``` js
var multicore = require('./');
var stream = multicore(require.resolve('./transform'));

for (var i = 0; i < 10; i++) {
  stream.write(''+i);
}
stream.end();

stream.on('data', function(data) {
  console.log(data); // prints <0>,<1>,<2>,...
});
stream.on('end', function() {
  console.log('stream has ended');
});
```
transform.js:
``` js
module.exports = function (data) {
  // Long, CPU-intensive process
  for(var i = 0; i < 700000000; i++) {
  }
  return '<' + data + '>';
};
```

## Notes

All transforms are Node 0.10 streams. Per default they are created with the options `{objectMode:true}`.

`modulePath` needs to be a distinct Node.js module. According to the [Node.js documentation](http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options):
> These child Nodes are still whole new instances of V8. Assume at least 30ms startup and 10mb memory for each new Node. That is, you cannot create many thousands of them.

If you need to pass complex objects into the transform function, you will need to serialize/deserialize them as JSON because all messages to the child processes are sent as strings.