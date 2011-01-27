var EventEmitter = require('events').EventEmitter;
var util = require('sys');

var Drain = function(expected, callback) {
  EventEmitter.call(this);
  if(callback) {
    this.on('full', callback);
  }
  this._expected = expected;
  this._calls = 0;
  //start the timer
  this._setTimeout();
};

util.inherits(Drain, EventEmitter);

var p = Drain.prototype;

p._setTimeout = function() {
  clearTimeout(this._timeoutId);
  var self = this;
  this._timeoutId = setTimeout(function() {
    var errorString = "Drain count of " + this._expected + " wasn't reached.  Only had " + this._calls + " add() calls";
    self.emit('error', errorString);
  }, 1000);
}

p.add = function() {
  if(++this._calls == this._expected) {
    clearTimeout(this._timeoutId);
    this.emit('full');
  } else {
    //reset timeout
    this._setTimeout();
  }
};

module.exports = Drain;
