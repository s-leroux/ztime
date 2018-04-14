const _debug=require("debug");
const debug=_debug("ztime:");
const Promise = require("bluebird");

const SPEC = [
  {
    /* I we match only time, today or the next day */
    re: /^([+-]?)((?:[01][0-9])|(?:2[0-3]))(?::([0-5][0-9])(?::([0-5][0-9]))?)?/,
    f: function(m) {
        const now = Date.now();
        const date = new Date(now);

        if (m[1] === "+") {
          date.setHours(date.getHours()+(+m[2]));
          date.setMinutes(date.getMinutes()+(+m[3]));
          date.setSeconds(date.getSeconds()+(+m[4]));
        }
        else if (m[1] === "-") {
          date.setHours(date.getHours()-(+m[2]));
          date.setMinutes(date.getMinutes()-(+m[3]));
          date.setSeconds(date.getSeconds()-(+m[4]));
        }
        else {
          let c = date.setHours(m[2], m[3]||0, m[4]||0);

          while (c < now) {
              c = date.setDate(date.getDate()+1); // should handle light saving time issues
          }
        }
        return date;

    }
  }
]

function parseTimeSpec(timespec) {
  const debug=_debug("ztime:parseTimeSpec");

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
class ztime {

  constructor(time) {
    if (typeof(time) === 'string')
      time = parseTimeSpec(time);

    const debug=_debug("ztime:ztime");
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

    return new ztime(moment);
  }

  /**
    The jitter is expressed as the amplitude netween min and max possible values.
  */
  jitter(amplitude) {
    if (typeof amplitude === 'number')
      amplitude = { milliseconds: amplitude };

    let milliseconds = 0;
    milliseconds += amplitude.hours*60*60*1000 || 0;
    milliseconds += amplitude.minutes*60*1000 || 0;
    milliseconds += amplitude.seconds*1000 || 0;
    milliseconds += amplitude.milliseconds || 0;

    // Find a number between (-jitter;+jitter) -- EXCLUSIVE on both sides
    let offset = 0;
    if (milliseconds) {
      while(offset == 0) {
          offset = Math.random()*milliseconds;
      }
    }
    offset -= milliseconds/2;

    return new ztime(this._time+offset);
  }

  wait(value) {
    const time = this;
    if (typeof value === 'undefined')
      value = time;

    return Promise.delay(time-Date.now(), this);
  }

  loop(delay, fn) {
    let schedule = this;

    const coroutine = Promise.coroutine(function*() {
      let n = 0;
      while(true) {
        if (n)
          yield schedule.wait();

        let result = fn(schedule, n);

        if (result) {
          yield Promise.resolve(result);
        }
        else {
          return result;
        }
      }
    });

    return coroutine();
  }
};

module.exports = function(date) {
  return new ztime(date);
}

module.exports.parseTimeSpec = parseTimeSpec;
