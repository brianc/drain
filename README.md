#drain

A way to help test async code.

A place to pour your completed events.

A way to help with coordinating async tasks.

A way to crash your node process if something hasn't happend within timeframe.

## Examples

Simple:

    var drain = new Drain(3);
    drain.on('full', function() {
      console.log('we done here');
    });

    drain.add();
    drain.add();
    console.log("hai!");
    drain.add();

    /* program output
      hai!
      we done here
    */

Async:

    var drain = new Drain(4, function() {
      console.log('bird');
      console.log('yeah');
    });

    setTimeout(function() { 
      console.log('mock');
      drain.add();
      setTimeout(function() {
        console.log('yeah');
        drain.add();
        setTimeout(function() {
          console.log('ing');
          drain.add();
          setTimeout(function() {
            console.log('yeah');
            drain.add();
          }, 100);
        }, 100);
      }, 100);       
    }, 100);

    /* program output
      mock
      yeah
      ing
      yeah
      bird
      yeah
    */

Timeouts (default 1 second)

When drain doesn't have an `add()` called within a certain timeout, drain will raise an 'error' event.  This is intended to be uncaught and crash your test case but you can catch it if you'd rather...

    var drain = new Drain(3);
    
    /*
      program crashes with uncaught exception after ~1 second
    */

Or how about this?

    var drain = new Drain(3);
    setTimeout(drain.add.bind(drain), 500);
    setTimeout(drain.add.bind(drain), 1000);
    //oh man we only need to add one more...but we don't...
    
    /*
      program crashes with unhandled 'error' event after ~2 seconds
    */


## okay so how does this help me?

Let's test an http request & response using Drain

    var http = require('http');

    var server = http.createServer(function(req, res) {
      res.writeHead(200, {"Content-Type" : "text/plain"} );
      res.end("hai!");
    });
    server.listen(3000);

    http.request('get', 'http://localhost:3000', function(response) {
      drain.set();
    });

    var drain = new Drain(1, function() {
      server.end();
    });

Now our test wont hang forever if the request doesn't come back.  At least all this...is the eventual goal
