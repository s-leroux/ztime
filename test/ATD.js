const atd = require("../index.js");
const { assert } = require("chai");
const Promise = require("bluebird");

describe("atd", function() {
  const now = Date.now();

  it("should accept a date object in constructor", () => {
    const date = atd(new Date(now));

    assert.equal(date.time, now);
  });

  it("should accept a numeric as date object in constructor", () => {
    const date = atd(now);

    assert.equal(date.time, now);
  });

  it("should accept string-time as date object in constructor", () => {
    const date = atd("10:30").date;
    
    assert.equal(date.getMinutes(), 30);
    assert.equal(date.getHours(), 10);
  });

});


describe("atd.jitter", function() {
  it("should return time between +/- jitter excluded", () => {
    for(let i =0; i < 250; ++i) {
      const date = atd(0).jitter(1);
      
      assert.isAbove(date.time, -1);
      assert.isBelow(date.time, +1);
    }
  });
    
});


describe("atd.plus", function() {
  const now = Date.now();

  it("should accept milliseconds", () => {
    const delta = 101;
    const date = atd(now);
    
    assert.equal(date.plus(+delta).time, now+delta);
    assert.equal(date.plus(-delta).time, now-delta);
  });

  it("should accept an object specifying the time offset", () => {
    const delta = 101;
    const date = atd(now);
    
    assert.equal(date.plus({milliseconds: +delta}).time, now+delta);
    assert.equal(date.plus({milliseconds: -delta}).time, now-delta);
  });
    
});


describe("atd.wait", function() {
  it("should return a promise", () => {
    return atd(Date.now()).wait().finally(()=>{});
  });

  it("should fulfill wait to the past", (done) => {
    this.timeout(5);
    atd(Date.now()-1000).wait().finally(()=>done());
  });

  it("should fulfill wait to the present", (done) => {
    this.timeout(5);
    atd(Date.now()).wait().finally(()=>done());
  });

  it("should wait until the near future", (done) => {
    atd(Date.now()+10).wait().finally(done);
  });

  it("should wait until the far future", (done) => {
    let pending = true;
    Promise.any([
      atd(Date.now()+5000).wait().finally(()=> pending=false),
      Promise.delay(500), // timeout
    ]).finally(() => {
      assert.isTrue(pending);
      done();
    });
  });
    
});
