'use strict';

var util     =  require('util')
  , stream   =  require('stream')
  , Readable =  stream.Readable

module.exports = WatcherReadable;

function defaultStateProps () {
  return [ 'highWaterMark', 'bufferLength' ];
}

util.inherits(WatcherReadable, Readable);
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
      readable: opts.readable || defaultStateProps()
    , writable: opts.writable || defaultStateProps() 
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
  if (self._ending) return self.push(null);

  var info = this._streamInfo;
  var r = { label: this._label };

  if (info.readable) r.readable = this.reportReadable(info.readable);
  if (info.writable) r.writable = this.reportWritable(info.writable);
  if (info.index) r.index = info.index;

  this.push(r);
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

proto.endSoon = function () {
  this._ending = true;
}
