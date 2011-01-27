var EventEmitter = require('events').EventEmitter;
var util = require('sys');

var Drain = function(expected, timeout, callback) {
  EventEmitter.call(this);
  if(typeof timeout == 'function') {
    callback = timeout;
    timeout = 1000;
  }
  if(callback) {
    this.on('full', callback);
  }
  this._expected = expected || 1;
  this._calls = 0;
  //start the timer
  this._setTimeout();
};

util.inherits(Drain, EventEmitter);

var p = Drain.prototype;

p._setTimeout = function() {
  this._timeoutId = setTimeout(function() {
    this.emit('error', "wasn't called in time");
  }.bind(this), 1000);
};

p.set = function() {
  clearTimeout(this._timeoutId);
  if(++this._calls == this._expected) {
    this.emit('full');
  } else {
    //reset timeout
    this._setTimeout();
  }
};

p.expect = function(count) {
  this._expected += count;
}

module.exports = Drain;
