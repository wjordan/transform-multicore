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
