'use strict';
/*jshint asi: true */

var test = require('tap').test
var nebraska = require('../')
var powers = require('./fixtures/power-transform')
var devnull = require('dev-null')

var stream = require('stream')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nduplex non-flowing', function (t) {
  t.plan(2)
  var duplex = powers()

  var duplexStates = nebraska(duplex, { interval: null });
  
  duplexStates.once('readable', function () {
    var state = duplexStates.read()
    t.deepEqual(
        state
      , { label: 'PowerTransform(S)',
          readable: { highWaterMark: 16384, bufferLength: 0 },
          writable: { highWaterMark: 16384, bufferLength: 0 } }
      , 'before write stream emits reads label, hwm and bufferlength (0) for readable and writable states'
    )

    duplex.write('1');
    duplexStates.once('readable', function () {
      var state = duplexStates.read()
      t.deepEqual(
          state
        , { label: 'PowerTransform(S)',
            readable: { highWaterMark: 16384, bufferLength: 1 },
            writable: { highWaterMark: 16384, bufferLength: 0 } }
        , 'after write stream emits reads label, hwm and bufferlength (1) for readable and writable states'
      )
      duplexStates.endSoon()
    })
  })
})
