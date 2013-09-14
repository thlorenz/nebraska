'use strict';

var numbers = require('../test/fixtures/number-readable');
var nebraska = require('../');

var readable = numbers({ to: 5, interval: 1000 })
var numbersState = nebraska(readable, { interval: 500 })

readable
  .on('end', numbersState.endSoon.bind(numbersState))
  .pipe(process.stdout);
  
numbersState.on('data', console.log.bind(console));
