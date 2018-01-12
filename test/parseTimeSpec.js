const { parseTimeSpec } = require("../index.js");
const { assert } = require("chai");

describe("parseTimeSpec", function() {
  const HH="12";
  const MM="34";
  const SS="56";
  it("should parse HH:MM format", () => {
    const spec = `${HH}:${MM}`;
    const time = parseTimeSpec(spec);

    assert.equal(time.getHours(), HH);
    assert.equal(time.getMinutes(), MM);
    assert.equal(time.getSeconds(), '00');
  });

  it("should parse HH format", () => {
    const spec = `${HH}`;
    const time = parseTimeSpec(spec);

    assert.equal(time.getHours(), HH);
    assert.equal(time.getMinutes(), '00');
    assert.equal(time.getSeconds(), '00');
  });

  it("should parse HH:MM:SS format", () => {
    const spec = `${HH}:${MM}:${SS}`;
    const time = parseTimeSpec(spec);

    assert.equal(time.getHours(), HH);
    assert.equal(time.getMinutes(), MM);
    assert.equal(time.getSeconds(), SS);
  });

  it("should returns the closest time in the future", () => {
    const now = Date.now();

    for(let time of ["00:00", "23:59"]) {
      assert.isTrue(parseTimeSpec(time) >= now);
      assert.isBelow(parseTimeSpec(time)-now, 24*60*60*1000);
    }
  });
})
