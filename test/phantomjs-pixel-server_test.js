var assert = require('assert');
var fs = require('fs');
var spawn = require('child_process').spawn;
var getPixels = require('get-pixels');
var ndarray = require('ndarray');
var request = require('request');
var savePixels = require('save-pixels');

describe('phantomjs-pixel-server', function () {
  before(function (done) {
    this.child = spawn('phantomjs', [__dirname + '/../lib/phantomjs-pixel-server.js'], {stdio: [0, 1, 2]});
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
        // TODO: Move to function over vanilla JS so the callback makes sense
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
    before(function () {
      try {
        this.actualPixels = JSON.parse(this.body);
      } catch (e) {
        console.log('Body was ', this.body);
        throw e;
      }
    });

    if (process.env.DEBUG_TEST) {
      before(function (done) {
        var png = savePixels(ndarray(this.actualPixels, [10, 10, 4], [4 * 10, 4, 1], 0), 'png');
        try { fs.mkdirSync(__dirname + '/actual-files'); } catch (e) {}
        png.pipe(fs.createWriteStream(__dirname + '/actual-files/checkerboard.png'));
        png.on('end', done);
      });
    }

    it('returns an array of pixel values', function (done) {
      var that = this;
      getPixels(__dirname + '/expected-files/checkerboard.png', function (err, expectedPixels) {
        if (err) {
          return done(err);
        }
        assert.deepEqual(that.actualPixels, [].slice.call(expectedPixels.data));
      });
    });
  });

  describe.skip('given commands which encrypt as a string', function () {
    // DEV: These were optimal for gifsockets but proved troublesome on Windows with stdout
    // TODO: Look into if Windows + stdout gives us the same trouble
    // TODO: Will the output have to be offset since we are over HTTP?
    it('gives an encoded string which corresponds to pixel values', function () {

    });
  });
});
