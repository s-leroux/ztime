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
  })
})
