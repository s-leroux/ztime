const ztime = require("../index.js");
const { assert } = require("chai");
const Promise = require("bluebird");

describe("ztime", function() {
  const now = Date.now();

  it("should accept a date object in constructor", () => {
    const date = ztime(new Date(now));

    assert.equal(date.time, now);
  });

  it("should accept a numeric as date object in constructor", () => {
    const date = ztime(now);

    assert.equal(date.time, now);
  });

  it("should accept string-time as date object in constructor", () => {
    const date = ztime("10:30").date;

    assert.equal(date.getMinutes(), 30);
    assert.equal(date.getHours(), 10);
  });

});


describe("ztime.jitter", function() {
  it("should return time between +/- jitter excluded", () => {
    for(let i =0; i < 250; ++i) {
      const date = ztime(0).jitter(2); // 2 milliseconds amplitude centered on 0

      assert.isAbove(date.time, -1);
      assert.isBelow(date.time, +1);
    }
  });

  it("should accept seconds", () => {
    for(let i =0; i < 250; ++i) {
      const date = ztime(0).jitter({seconds: 2});

      assert.isAbove(date.time, -1*1000);
      assert.isBelow(date.time, +1*1000);
    }
  });

  it("should accept minutes", () => {
    for(let i =0; i < 250; ++i) {
      const date = ztime(0).jitter({minutes: 2});

      assert.isAbove(date.time, -1*60*1000);
      assert.isBelow(date.time, +1*60*1000);
    }
  });

  it("should accept hours", () => {
    for(let i =0; i < 250; ++i) {
      const date = ztime(0).jitter({hours: 2});

      assert.isAbove(date.time, -1*60*60*1000);
      assert.isBelow(date.time, +1*60*60*1000);
    }
  });

});


describe("ztime.plus", function() {
  const now = Date.now();

  it("should accept milliseconds", () => {
    const delta = 101;
    const date = ztime(now);

    assert.equal(date.plus(+delta).time, now+delta);
    assert.equal(date.plus(-delta).time, now-delta);
  });

  it("should accept an object specifying the time offset", () => {
    const delta = 101;
    const date = ztime(now);

    assert.equal(date.plus({milliseconds: +delta}).time, now+delta);
    assert.equal(date.plus({milliseconds: -delta}).time, now-delta);
  });

});


describe("ztime.wait", function() {
  it("should return a promise", () => {
    return ztime(Date.now()).wait().finally(()=>{});
  });

  it("should fulfill wait to the past", (done) => {
    this.timeout(5);
    ztime(Date.now()-1000).wait().finally(()=>done());
  });

  it("should fulfill wait to the present", (done) => {
    this.timeout(5);
    ztime(Date.now()).wait().finally(()=>done());
  });

  it("should wait until the near future", (done) => {
    ztime(Date.now()+10).wait().finally(done);
  });

  it("should wait until the far future", (done) => {
    let pending = true;
    Promise.any([
      ztime(Date.now()+5000).wait().finally(()=> pending=false),
      Promise.delay(500), // timeout
    ]).finally(() => {
      assert.isTrue(pending);
      done();
    });
  });

});



describe("ztime.loop", function() {
  const debug = require("debug")("ztime:loop-test");
  const MS = 10;
  const N = 10;

  it("should loop when calling next()", () => {
    this.timeout(N*MS*1.1);

    const start = Date.now();
    let n = N+1;
    return ztime(start)
      .loop((date, next) => {
        debug(date);
        if (n -= 1)
          next(date.plus({milliseconds: MS}));
      })
      .then(() => {
        assert.equal(n, 0);
        assert.isAbove(Date.now()-start, N*MS);
      });
  });

  it("should accept jitter in next()", () => {
    const JITTER=5;
    this.timeout(N*MS*2);

    const start = Date.now();
    let n = N+1;
    return ztime(start)
      .loop((date, next) => {
        debug(date);
        if (n -= 1)
          next(date.plus({milliseconds: MS}).jitter({milliseconds: JITTER}));
      })
      .then(() => {
        assert.isAbove(Date.now()-start, N*(MS-JITTER));
        assert.isBelow(Date.now()-start, N*(MS+JITTER));
      });
  });

  it("should wait for the starting date", () => {
    const JITTER=5;
    this.timeout(N*MS*2);

    const start = Date.now();
    let n = N+1;
    return ztime(start+100)
      .loop((date, next) => {
        debug(date);
        if (n -= 1)
          next(date.plus({milliseconds: MS}).jitter({milliseconds: JITTER}));
      })
      .then(() => {
        assert.isAbove(Date.now()-start, 100+N*(MS-JITTER));
        assert.isBelow(Date.now()-start, 100+N*(MS+JITTER));
      });
  });

});
