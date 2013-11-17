# phantomjs-pixel-server [![Build status](https://travis-ci.org/twolfson/phantomjs-pixel-server.png?branch=master)](https://travis-ci.org/twolfson/phantomjs-pixel-server)

[PhantomJS][] server that converts canvas actions into pixels

This is part of the [gifsockets][] project.

[PhantomJS]: http://phantomjs.org/
[gifsockets]: https://github.com/twolfson/gifsockets-server

## Getting Started
Install the module with: `npm install -g phantomjs-pixel-server`

Start a server and get some pixels:

```bash
bin/phantomjs-pixel-server &
# PhantomJS server is running at http://127.0.0.1:9090/
curl http://127.0.0.1:9090/ -X POST --data \
'{"width":10,"height":10,"js":{"params":["canvas","cb"], '\
'"body":"var context = canvas.getContext(\"2d\"); '\
'context.fillStyle = \"#BADA55\"; context.fillRect(0, 0, 10, 10); cb();"}}'
# [186,218,85,255,186,218, ..., 255]
```

With [request][], that would look like:

[request]: https://github.com/mikeal/request

```js
// We use JSON as our body and must serialize it in this maner
var arg = JSON.stringify({
  width: 10,
  height: 10,
  js: {
    params: ["canvas", "cb"],
    body: [
      'var context = canvas.getContext(\'2d\');'
      'context.fillStyle = \'#BADA55\';',
      'context.fillRect(0, 0, 10, 10);',
      'cb();'
    ].join('')
  }
});
var encodedArg = encodeURIComponent(arg);

// Request to our server
request({
  url: 'http://localhost:9090/',
  method: 'POST',
  headers: {
    // PhantomJS looks for Proper-Case headers, request is lower-case
    // This means you *must* supply this header
    'Content-Length': encodedArg.length
  },
  body: encodedArg,
}, function handlePhantomResponse (err, res, body) {
  // body is "[186,218,85,255,186,218, ..., 255]"
});
```

## Documentation
The CLI command for `phantomjs-pixel-server` is a `node` wrapper which invokes a [PhantomJS][] script. The script path is resolved by `node's` `require` function.

```js
// Resolve locally installed server path
// '/home/todd/github/phantomjs-pixel-server/lib/phantomjs-pixel-server.js'
require.resolve('phantomjs-pixel-server');
```

Inside the server, we use [commander][] to accept different parameters for the server. Currently, we only support `port`.

```bash
$ phantomjs-pixel-server --help

  Usage: phantomjs-pixel-server.js [options]

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --port <port>  Port to run the server on
```

## Donating
Support this project and [others by twolfson][gittip] via [gittip][].

[![Support via Gittip][gittip-badge]][gittip]

[gittip-badge]: https://rawgithub.com/twolfson/gittip-badge/master/dist/gittip.png
[gittip]: https://www.gittip.com/twolfson/

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Unlicense
As of Nov 15 2013, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
