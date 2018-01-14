const _debug=require("debug");
const debug=_debug("atd:");
const Promise = require("bluebird");

const SPEC = [
  {
    /* I we match only time, today or the next day */
    re: /((?:[01][0-9])|(?:2[0-3]))(?::([0-5][0-9])(?::([0-5][0-9]))?)?/,
    f: function(m) {
        const now = Date.now();
        const date = new Date(now);

        let c = date.setHours(m[1], m[2]||0, m[3]||0);

        while (c < now) {
            c = date.setDate(date.getDate()+1); // should handle light saving time issues
        }

        return date;

    }
  }
]

function parseTimeSpec(timespec) {
  const debug=_debug("atd:parseTimeSpec");

  for(let s of SPEC) {
    const m = timespec.match(s.re);
    debug("%s match %s: ", timespec, s.re, m);

    if (m) {
        return s.f(m);
    }
  }

  throw { message: "Parse error: "+timespec, what: timespec };
}


/*
  A moment in time expressed as milliseconds since Epoch UTC.
*/
class ATD {

  constructor(time) {
    if (typeof(time) === 'string')
      time = parseTimeSpec(time);
      
    const debug=_debug("atd:ATD");
    this._time = +time;
    
    if (Number.isNaN(this._time)) {
      throw { message: "Invalid value: "+time, what: time };
    }
  }
  
  get time() {
    return this._time;
  }
  
  get date() {
    return new Date(this._time);
  }
  
  valueOf() {
    return this._time;
  }
  
  plus(delta) {
    if (typeof delta === 'number')
      delta = { milliseconds: delta };
      
    let moment = this._time;
    
    moment += delta.milliseconds || 0;
    
    return new ATD(moment);
  }
  
  jitter(milliseconds) {
    // Find a number between (-jitter;+jitter) -- EXCLUSIVE on both sides
    let offset = 0;
    while(offset == 0) {
        offset = Math.random()*2*milliseconds;
    }
    offset -= milliseconds;
    
    return new ATD(this._time+offset);
  }
  
  wait(value) {
    const time = this._time;
    if (typeof value === 'undefined')
      value = time;
      
    return Promise.delay(time-Date.now(), value);
  }
};

module.exports = function(date) {
  return new ATD(date);
}

module.exports.parseTimeSpec = parseTimeSpec;
