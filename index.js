'use strict';

var util     =  require('util')
  , stream   =  require('stream')
  , Readable =  stream.Readable

module.exports = exports = WatcherReadable;

var defaultStateProps = [ 'highWaterMark', 'bufferLength' ];

util.inherits(WatcherReadable, Readable);
/**
 * Creates a readable stream that streams readable/writable state changes of the given stream.
 * 
 * @name WatcherReadable
 * @function
 * @param stream {Stream} a readable and/or writable stream whose states to stream
 * @param opts {Object} with the following properties
 *  - interval {Number} the millisecond interval at which state updates are streamed (default: 500)
 *  - readable {Array[String]} names of readable properties that should be included in the state stream (default: highWaterMark, bufferLength)
 *  - writable {Array[String]} names of writable properties that should be included in the state stream (default: highWaterMark, bufferLength)
 *  - label {String} label that is emitted with every state update (default: the name of the stream constructor + (S))
 * @return 
 */
function WatcherReadable (stream, opts) { 
  if (!(this instanceof WatcherReadable)) return new WatcherReadable(stream, opts);
  var self = this;

  opts = opts || {};
  opts.objectMode = true;
  Readable.call(this, opts);

  // null mostly for testing
  if (opts.interval === null) this._interval = null;
  else                        this._interval = opts.interval || 500;

  this._properties = { 
      readable: opts.readable || defaultStateProps
    , writable: opts.writable || defaultStateProps
  };

  var info = {};
  if (stream._readableState) info.readable = stream._readableState;
  if (stream._writableState) info.writable = stream._writableState;
  this._streamInfo = info;

  this._label = opts.label || stream.constructor.name + '(S)';
  this._ending = false;
}

var proto = WatcherReadable.prototype;

proto._read = function () {
  var self = this;
  function report () {
    self._report();
  }

  if (self._ending) return self.push(null);

  setTimeout(report, this._interval);
}

proto._report = function () {
  var self = this;
  if (this._readableState.ended || this._readableState.ending) return;

  var info = this._streamInfo;
  var r = { label: this._label };

  if (info.readable) r.readable = this.reportReadable(info.readable);
  if (info.writable) r.writable = this.reportWritable(info.writable);
  if (info.index) r.index = info.index;

  this.push(r);
  if (self._ending) return self.push(null);
}

proto._reportState = function (stateName, state) {
  var report = {}
    , properties = this._properties[stateName];

  properties.forEach(reportOn);

  function reportOn (k) {
    report[k] = state[k];
  }

  if (~properties.indexOf('bufferLength')) report.bufferLength = state.buffer.length;
  return report;
}

proto.reportReadable = function (readable) {
  return this._reportState('readable', readable);
}

proto.reportWritable = function (writable) {
  return this._reportState('writable', writable);
}

/**
 * Call this in case you want to tell the state stream to end.
 * Useful for testing and/or when you want to end your debugging session and allow the program to exit.
 * 
 * @name endSoon
 * @function
 */
proto.endSoon = function () {
  this._ending = true;
}

/**
 * Arrays of all property names for each type of stream which make sense to be included in state updates.
 */
exports.properties = {
    writable: [ 
        'highWaterMark'
      , 'objectMode'
      , 'needDrain'
      , 'ending'
      , 'ended'
      , 'finished'
      , 'decodeStrings'
      , 'defaultEncoding'
      , 'length'
      , 'writing'
      , 'sync'
      , 'bufferProcessing'
      , 'writelen'
      , 'bufferLength'
    ]
  , readable: [
        'highWaterMark'
      , 'length'
      , 'pipesCount'
      , 'flowing'
      , 'ended'
      , 'endEmitted',
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
      , 'encoding'
      , 'bufferLength'

    ]
};
