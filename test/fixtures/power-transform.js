'use strict';

var util      =  require('util')
  , stream    =  require('stream')
  , Transform =  stream.Transform
  ;

module.exports = PowerTransform;

util.inherits(PowerTransform, Transform);

function PowerTransform (opts) {
  if (!(this instanceof PowerTransform)) return new PowerTransform(opts);

  opts = opts || {};
  Transform.call(this, opts);
}

PowerTransform.prototype._transform = function (chunk, encoding, cb) {
  var num = parseInt(chunk, 10);
  this.push('' + (num * num));
  cb();
}
