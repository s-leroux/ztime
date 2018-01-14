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
      const date = ztime(0).jitter(1);
      
      assert.isAbove(date.time, -1);
      assert.isBelow(date.time, +1);
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
