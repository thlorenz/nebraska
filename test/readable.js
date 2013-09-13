'use strict';
/*jshint asi: true */

var test = require('tap').test
var nebraska = require('../')
var numbers = require('./fixtures/number-readable')
var devnull = require('dev-null')

var stream = require('stream')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nreadable non-flowing', function (t) {
  t.plan(2)
  var readable = numbers({ to: 1 })

  var readableStates = nebraska(readable, { interval: null });
  
  readableStates.once('readable', function () {
    t.deepEqual(
        readableStates.read()
      , { label: 'NumberReadable(S)', readable: { highWaterMark: 16384, bufferLength: 0 } }
      , 'before stream emits reads label, hwm and bufferlength (0)'
    )

    // turn on flowing mode, otherwise on('end') is not called (thanks @substack)
    readable
      .on('data', function (d) {})
      .once('end', function () { 
        t.deepEqual(
            readableStates.read()
          , { label: 'NumberReadable(S)', readable: { highWaterMark: 16384, bufferLength: 0 } }
          , 'after stream emits reads label, hwm and bufferlength (0)'
        )
        readableStates.endSoon();  
    })
  })
})

function check(t, opts, expected, msg) {
  var readable = numbers({ to: 1 })

  var readableStates = nebraska(
      readable
    , { interval: null, readable: opts.readable, writable: opts.writable }
  );

  readable
    .on('data', function () {})
    .once('end', function () { 
      readableStates.once('readable', function () {
        var res = readableStates.read();
        if (opts.debug) inspect(res)
        t.deepEqual(
            res  
          , expected 
          , msg 
        )
        readableStates.endSoon();  
        t.end()
      })
  })
}

test('\nreadable empty config properties', function (t) {
  check(t
    , { readable: [] }
    , { label: 'NumberReadable(S)', readable: {} }
    , 'stream emits reads label only'
  );
})

test('\nreadable all meaningful config properties', function (t) {
  check(t
    , { readable: [ 
          'highWaterMark'
        , 'length'
        , 'pipes'
        , 'pipesCount'
        , 'flowing'
        , 'ended'
        , 'endEmitted'
        , 'reading'
        , 'calledRead'
        , 'sync'
        , 'needReadable'
        , 'emittedReadable'
        , 'readableListening'
        , 'objectMode'
        , 'defaultEncoding'
        , 'ranOut'
        , 'awaitDrain'
        , 'readingMore'
        , 'decoder'
        , 'encoding'
        ]
      , debug: false
      }
    , { label: 'NumberReadable(S)',
        readable: { 
          highWaterMark: 16384,
          length: 0,
          pipes: null,
          pipesCount: 0,
          flowing: false,
          ended: true,
          endEmitted: true,
          reading: false,
          calledRead: true,
          sync: false,
          needReadable: true,
          emittedReadable: false,
          readableListening: false,
          objectMode: false,
          defaultEncoding: 'utf8',
          ranOut: false,
          awaitDrain: 0,
          readingMore: false,
          decoder: null,
          encoding: null } 
      }
    , 'stream emits values for all properties'
  );
})
