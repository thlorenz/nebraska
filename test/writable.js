'use strict';
/*jshint asi: true */

var test = require('tap').test
var nebraska = require('../')
var tarpit = require('./fixtures/tarpit-writable')
var devnull = require('dev-null')

var stream = require('stream')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function check(t, opts, expected, msg) {
  var writable = tarpit({ debug: opts.debug })
  var writableStates = nebraska(writable, opts);
  
  writableStates.once('readable', function () {
    var state = writableStates.read()
    if (opts.debug) inspect(state);
    t.deepEqual(
        state
      , expected
      , msg
    )
    writableStates.endSoon()
    t.end()
  })
}

test('\nwritable default opts', function (t) {
  check(t
    , { debug: false }
    , { label: 'TarpitWritable(S)', writable: { highWaterMark: 16384, bufferLength: 0 } }
    , 'before stream emits reads label, hwm and bufferlength (0)'
  )
})

test('\nwritable empty config properties', function (t) {
  check(t
    , { debug: false, writable: [] }
    , { label: 'TarpitWritable(S)', writable: {} }
    , 'stream emits reads label only'
  )
})

test('\nwritable all meaningful config properties', function (t) {
  check(t
    , { writable: nebraska.properties.writable, debug: true }
    , { label: 'TarpitWritable(S)',
        writable:
        { highWaterMark    :  16384,
          objectMode       :  false,
          needDrain        :  false,
          ending           :  false,
          ended            :  false,
          finished         :  false,
          decodeStrings    :  true,
          defaultEncoding  :  'utf8',
          length           :  0,
          writing          :  false,
          sync             :  true,
          bufferProcessing :  false,
          writelen         :  0,
          bufferLength     :  0 } }
    , 'stream emits values for all properties'
  );
})
