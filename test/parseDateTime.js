"use strict";

const { parseDateTime } = require("../index.js");
const { assert } = require("chai");

describe("parseDateTime", function() {
  const YEAR="2022";
  const MONTH="02"; // JAN == 1 !
  const DAY="28";
  const HOUR="12";
  const MIN="34";
  const SEC="56";

  it("should parse HOUR:MIN format", () => {
    const spec = `${HOUR}:${MIN}`;
    const date = parseDateTime(spec).date;

    assert.equal(date.getUTCHours(), HOUR);
    assert.equal(date.getUTCMinutes(), MIN);
    assert.equal(date.getUTCSeconds(), "00");
  });

  it("should parse HOUR format", () => {
    const spec = `${HOUR}`;
    const date = parseDateTime(spec).date;

    assert.equal(date.getUTCHours(), HOUR);
    assert.equal(date.getUTCMinutes(), "00");
    assert.equal(date.getUTCSeconds(), "00");
  });

  it("should parse HOUR:MIN:SEC format", () => {
    const spec = `${HOUR}:${MIN}:${SEC}`;
    const date = parseDateTime(spec).date;

    assert.equal(date.getUTCHours(), HOUR);
    assert.equal(date.getUTCMinutes(), MIN);
    assert.equal(date.getUTCSeconds(), SEC);
  });

  it("should parse simplified ISO 8601 date-time", () => {
    const spec = `${YEAR}-${MONTH}-${DAY}T${HOUR}:${MIN}:${SEC}Z`;
    const date = parseDateTime(spec).date;

    assert.equal(date.getUTCFullYear(), YEAR, "YEAR");
    assert.equal(date.getUTCMonth(), MONTH-1, "MONTH");
    assert.equal(date.getUTCDate(), DAY, "DAY");
    assert.equal(date.getUTCHours(), HOUR, "HOUR");
    assert.equal(date.getUTCMinutes(), MIN, "MIN");
    assert.equal(date.getUTCSeconds(), SEC, "SEC");
  });

  it("should returns the closest time in the future", () => {
    const now = Date.now();

    for(let time of ["00:00", "23:59"]) {
      assert.isTrue(parseDateTime(time) >= now);
      assert.isBelow(parseDateTime(time)-now, 24*60*60*1000);
    }
  });

  it("should parse the day of week", function() {
    const now = new Date();
    const intl = Intl.DateTimeFormat("en-US", {  weekday: "long", });

    for (let day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) {
      const target = parseDateTime(day);

      assert.isTrue(target > now);
      assert.equal(intl.formatToParts(target)[0].value, day);
    }
  });


  it("should handle leading + as relative time", () => {
    const spec = "+01:23:45";
    const time = parseDateTime(spec);
    const delta = time - Date.now();

    console.log(new Date(), time);
    assert.closeTo(delta, (1*60*60+23*60+45)*1000, 50);
  });

  it("should handle leading - as relative time", () => {
    const spec = "-01:23:45";
    const time = parseDateTime(spec);
    const delta = Date.now() - time;

    assert.closeTo(delta, (1*60*60+23*60+45)*1000, 50);
  });

  it("should parse origin+offset", () => {
    const spec = `${YEAR}-${MONTH}-${DAY}T${HOUR}:${MIN}:${SEC}Z`;
    const ref = new Date(spec);
    ref.setUTCHours(ref.getUTCHours()+2);
    ref.setUTCMinutes(ref.getUTCMinutes()+30);

    const time = parseDateTime(`${spec} +02:30`).time;

    assert.equal(time, ref.valueOf());
  });
});
