var spawn = require('child_process').spawn;
var request = require('request');

describe('phantomjs-pixel-server', function () {
  before(function (done) {
    this.child = spawn(__dirname + '/../bin/phantomjs-pixel-server', [], {stdio: [0, 1, 2]});
    setTimeout(function () {
      // TODO: We could wait for 200 from server
      done();
    }, 1000);
  });
  after(function (done) {
    this.child.kill();
    this.child.on('exit', function (code, signal) {
      done();
    });
  });

  describe('given a set of commands on a canvas', function () {
    before(function (done) {
      // Stringify our argument for phantomjs
      var params = {
        width: 10,
        height: 10,
        js: [
          // Draw a white on black checkerboard
          'context.fillStyle = "#000000";',
          'context.fillRect(0, 0, 10, 10);',
          'context.fillStyle = "#FFFFFF";',
          'context.fillRect(0, 0, 5, 5);',
          'context.fillRect(5, 5, 5, 5);',
          'cb();'
        ].join('\n')
      };
      var arg = JSON.stringify(params);
      var encodedArg = encodeURIComponent(arg);

      // Request to our server
      var that = this;
      request({
        url: 'http://localhost:9090/',
        method: 'POST',
        headers: {
          // DEV: PhantomJS looks for Proper-Case headers, request is lower-case =(
          // TODO: Note this in the README
          'Content-Length': encodedArg.length
        },
        body: encodedArg,
      }, function handlePhantomResponse (err, res, body) {
        that.res = res;
        that.body = body;
        done(err);
      });
    });

    it('returns an array of pixel values', function () {
      console.log(this.body.length);
    });
  });
});
