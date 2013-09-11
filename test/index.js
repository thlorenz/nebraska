'use strict';
/*jshint asi: true */

var test = require('tap').test
var nebraska = require('../')
var numbers = require('./fixtures/number-readable')
var devnull = require('dev-null')

var stream = require('stream')

test('\nreadable', function (t) {
  var readable = numbers({ to: 1 })

  var state = readable._readableState
  var readableStates = nebraska(readable, { label: 'foo', interval: null });
  var states = [];
  

  readableStates.once('readable', function () {
    t.deepEqual(
        readableStates.read()
      , { label: 'NumberReadable(W)', readable: { bufferLength: 0 } }
      , 'before stream emits reads label and bufferlength (0)'
    )

    // turn on flowing mode, otherwise on('end') is not called (thanks @substack)
    readable
      .on('data', function () {})
      .once('end', function () { 
        t.deepEqual(
            readableStates.read()
          , { label: 'NumberReadable(W)', readable: { bufferLength: 0 } }
          , 'after stream emits reads label and bufferlength (0)'
        )
        readableStates.endSoon();  
        t.end()
    })
  })
})
