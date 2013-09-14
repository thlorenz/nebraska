# nebraska [![build status](https://secure.travis-ci.org/thlorenz/nebraska.png)](http://travis-ci.org/thlorenz/nebraska)

Streams the state of another stream.

```js
var nebraska = require('nebraska');

var numbers = require('../test/fixtures/number-readable');
var powers = require('../test/fixtures/power-transform');

// the numbers readable emits numbers faster than the powers transfom
// can handle them (simulated via throttle settings)
var readable  =  numbers({ to: 10, throttle: 100, objectMode: true, highWaterMark: 0 })
  , transform =  powers({ throttle: 400, objectMode: true, highWaterMark: 4  })

var numbersState = nebraska(readable, { interval: 400 })
  , powersState  = nebraska(transform, { interval: 400 })

readable
  .on('data', function (d) { console.log('Emitted: ', d.toString()) })
  .on('end', numbersState.endSoon.bind(numbersState))
  .pipe(transform)
  .on('data', function (d) { console.log('Transformed: ', d.toString()) })
  .on('end', powersState.endSoon.bind(powersState))

numbersState.on('data', console.log.bind(console));
powersState.on('data', console.log.bind(console));
```

**Output:** that shows that buffer is filled to `highWaterMark` and drained while the faster number stream gets paused
due to backpressure.

```sh
Emitted:  0
Emitted:  1
Emitted:  2
Emitted:  3
{ label: 'NumberReadable(S)',
  readable: { highWaterMark: 0, bufferLength: 0 } }
{ label: 'PowerTransform(S)',
  readable: { highWaterMark: 4, bufferLength: 0 },
  writable: { highWaterMark: 4, bufferLength: 3 } }
Transformed:  0
{ label: 'NumberReadable(S)',
  readable: { highWaterMark: 0, bufferLength: 1 } }
{ label: 'PowerTransform(S)',
  readable: { highWaterMark: 4, bufferLength: 0 },
  writable: { highWaterMark: 4, bufferLength: 2 } }
Transformed:  1
{ label: 'NumberReadable(S)',
  readable: { highWaterMark: 0, bufferLength: 1 } }
{ label: 'PowerTransform(S)',
  readable: { highWaterMark: 4, bufferLength: 0 },
  writable: { highWaterMark: 4, bufferLength: 1 } }
Transformed:  4
{ label: 'NumberReadable(S)',
  readable: { highWaterMark: 0, bufferLength: 1 } }
{ label: 'PowerTransform(S)',
  readable: { highWaterMark: 4, bufferLength: 0 },
  writable: { highWaterMark: 4, bufferLength: 0 } }
Transformed:  9
Emitted:  4
Emitted:  5
Emitted:  6
Emitted:  7
{ label: 'NumberReadable(S)',
  readable: { highWaterMark: 0, bufferLength: 0 } }
{ label: 'PowerTransform(S)',
  readable: { highWaterMark: 4, bufferLength: 0 },
  writable: { highWaterMark: 4, bufferLength: 3 } }
Transformed:  16
[ ... ]
```

## Installation

    npm install nebraska

## API


## Why the name Nebraska?

Cause it has more streams than Montana.

## License

MIT
