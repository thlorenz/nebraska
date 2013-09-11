'use strict';

var util     =  require('util')
  , stream   =  require('stream')
  , Readable =  stream.Readable

module.exports = WatcherReadable;

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

  this._properties = opts.properties;

  var info = {};
  if (stream._readableState) info.readable = stream._readableState;
  if (stream._writableState) info.writable = stream._writableState;

  this._label = (opts.blessed && opts.blessed.label) || stream.constructor.name + '(W)';
  this._streamInfo = info;
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

  if (info.readable) r.readable = this._reportReadable(info.readable);
  if (info.writable) r.writable = this._reportWritable(info.writable);
  if (info.index) r.index = info.index;

  this.push(r);
}

proto._reportReadable = function (readable) {
  var report = {};

  // TODO: config these props
  [ // 'highWaterMark'
  //, 'objectMode'
  //, 'flowing'
  //, 'pipesCount'
  // , 'reading' 
  //, 'ranOut'
  //, 'awaitDrain'
  ].forEach(reportOn);

  function reportOn (k) {
    report[k] = readable[k];
  }

  report.bufferLength = readable.buffer.length;
  return report;
}

proto._reportWritable = function (writable) {
  var report = {};

  [ //'highWaterMark'
  ].forEach(reportOn);

  function reportOn (k) {
    report[k] = writable[k];
  }

  report.bufferLength = writable.buffer.length;
  return report;
}

proto.endSoon = function () {
  this._ending = true;
}
