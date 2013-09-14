var numbers = require('../test/fixtures/number-readable');
var powers = require('../test/fixtures/power-transform');
var nebraska = require('../');

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
