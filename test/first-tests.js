var Drain = require(__dirname + "/../lib/");
var should = require("should");
var assert = require("assert");


var test = function(name, action) {
  process.stdout.write(".");
  action();
};

should.call = function(timeout, actual) {
  if(typeof timeout == 'function') {
    actual = timeout;
    timeout = 1000;
  }
  var called = false;
  var id = setTimeout(function() {
    called.should.eql(true);
  }, timeout);
  return function() {
    clearTimeout(id);
    called = true;
    actual.apply(this, arguments);
  }
};

should.Assertion.prototype.emit = function(name, timeout, callback) {
  if(typeof timeout == 'function') {
    callback = timeout;
    timeout = 1000;
  }
  this.obj.on(name, should.call(timeout, callback));
};

test('full callback fires', function() {
  var drain = new Drain(1);
  var count = 0;
  drain.on('full', function() {
    count = 1;
  });
  count.should.eql(0);
  drain.add();
  count.should.eql(1);
});

test('can pass callback as ctor param', function() {
  var count = 0;
  var drain = new Drain(1, function() {
    count++;
  });
  count.should.eql(0);
  drain.add();
  count.should.eql(1);
})

test('muiltple adds', function() {
  var count = 0;
  var drain = new Drain(10, function() {
    count++;
  });
  count.should.eql(0);
  for(var i = 0; i < 9; i++) {
    drain.add();
  }
  count.should.eql(0);
  drain.add();
  count.should.eql(1);
})

test('an error', function() {

  test('firest if never added', function() {
    var start = new Date();
    var drain = new Drain(1);
    drain.should.emit('error', function() {
      var duration = (new Date()-start);
      duration.should.be.above(900);
      duration.should.be.below(1100);
    })
  })

  test('firest if add count is too low', function() {
    var start = new Date();
    var drain = new Drain(10);
    for(var i = 0; i < 9; i++) {
      setTimeout(function() {
        test('adds', function() {
          drain.add();
        })
      }, i * 100);
      drain.should.emit('error', 3000, function() {
        var duration = (new Date() - start);
        duration.should.be.above(1700);
        duration.should.be.below(2000);
      })
    }
  })
})
