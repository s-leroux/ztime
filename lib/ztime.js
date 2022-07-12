"use strict";

const debug=require("debug")("ztime:ztime");
const Promise = require("bluebird");

const ORIGINS = [
  {
    // '' | 'now' | 'today'  // XXX Should today be at 00:00:00 ?
    re: /^(?:|now|today)$/i,
    f: function(m) {   // eslint-disable-line no-unused-vars
      return new Date();
    }
  },
  {
    // day of week
    re: /^(?:next\s+)?(sunday)|(monday)|(tuesday)|(wednesday)|(thursday)|(friday)|(saturday)$/i,
    f: function(m) {
      const origin = new Date();

      //        sun mon tue wed thu fri sat
      //  sun    7   1   2   3   4   5   6
      //  mon    6   7   1   2   3   4   5
      //  tue    5   6   7   1   2   3   4
      //  wed    4   5   6   7   1   2   3
      //  thu    3   4   5   6   7   1   2
      //  fri    2   3   4   5   6   7   1
      //  sat    1   2   3   4   5   6   7
      //   ^
      // today
      let target = 0;
      while(true) {
        const next = target + 1;
        if (m[next])
          break;
        target = next;
      }

      let today = origin.getUTCDay();

      let delta = target - today;
      if (delta < 1)
        delta += 7;

      const result = new Date(origin);
      result.setUTCDate(result.getUTCDate()+delta);

      return result;
    }
  },
  {
    // HH:MM:SS format
    re: /^([0-9]+)(?::([0-9]+))?(?::([0-9]+))?$/,
    f: function(m) {
      const origin = new Date();
      const result = new Date(origin);
      result.setUTCHours(m[1], m[2]||0, m[3]||0);

      while (result < origin) {
        result.setUTCDate(result.getUTCDate()+1); // should handle light saving time issues
      }

      return result;
    }
  },
  {
    // ISO string YYYY-MM-DDThh:mm:ss.mmmZ
    re: /^([0-9]{4})(?:-([0-9]{2})(?:-([0-9]{2})))(?:T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:.([0-9]*))?))?Z$/,
    f: function(m) {
      const result = new Date(m[0]);

      if (Number.isNaN(+result)) {
        throw { message: "ZT010 Parse error: "+m[0], what: m[0] };
      }

      return result;
    }
  },
];

const DURATIONS = [
  {
    re: /^([0-9]+)(?::([0-9]+))?(?::([0-9]+))?$/,
    f: function(m) {
      const hh = +m[1];
      const mm = +(m[2]||0);
      const ss = +(m[3]||0);

      return {
        hours: hh,
        minutes: mm,
        seconds: ss,
      };
    }
  },
];

function _parseOrigin(str) {
  for (let s of ORIGINS) {
    const m = str.match(s.re);
    debug("%s match %s: ", str, s.re, m);

    if (m) {
      return new ztime(s.f(m));
    }
  }

  throw { message: "ZT011 Parse error: "+str, what: str };
}

function _parseDuration(duration) {
  for (let s of DURATIONS) {
    const m = duration.match(s.re);
    debug("%s match %s: ", duration, s.re, m);

    if (m) {
      return s.f(m);
    }

  }

  throw { message: "ZT012 Parse error: "+duration, what: duration };
}

/*
  Parse a datetime.

  DATETIME := ORIGIN (WS* ('+'|'-') DURATION)*

  ORIGIN := '' | 'now' | 'today' | 'next' DAYOFWEEK

  DAYOFWEEK := 'monday'..'sunday'
*/
function parseDateTime(str) {
  const datespec = str.split(/(?:\s+|^)([+-])/);

  let curr = _parseOrigin(datespec.shift());

  while(datespec.length) {
    const direction = datespec.shift();
    const offset = _parseDuration(datespec.shift());

    if (direction === "+") {
      curr = curr.plus(offset);
    }
    else if (direction === "-") {
      curr = curr.minus(offset);
    }
    else {
      throw { message: "ZT013 Parse error: "+str, what: str };
    }
  }

  return curr;
}


function toMilliseconds(amplitude) {
  if (typeof amplitude === "number")
    amplitude = { milliseconds: amplitude };

  let milliseconds = 0;
  milliseconds += amplitude.weeks*60*60*1000*24*7 || 0;
  milliseconds += amplitude.days*60*60*1000*24 || 0;
  milliseconds += amplitude.hours*60*60*1000 || 0;
  milliseconds += amplitude.minutes*60*1000 || 0;
  milliseconds += amplitude.seconds*1000 || 0;
  milliseconds += amplitude.milliseconds || 0;

  return milliseconds;
}

/**
 * A moment in time expressed as milliseconds since Epoch UTC.
 *
 * The constructor accept either a string parsed according to the custom
 * date-time minilanguage or a number of milliseconds since Epoch UTC.
 *
 *
 * ### The date-time mini-language:
 *
 * ```
 * date-time-spec: origin WS+ (('+'|'-') offset)+
 *
 * origin: '' | 'today' | 'now'
 *   | (hh:mmm | hh:mm:ss)
 *   | yyyy-mm-ddThh:mm:ssZ
 *   | ('sunday'| .. |'saturday')
 *
 * offset: (hh:mm | hh:mm:ss)
 *
 * ```
 *
 * When the date is not explicitly specified, events are create in the future.
 * So `ztime("monday")` is *next* monday (excl. today).
 *
 * ### Duration objects
 *
 * Duration are expressed as JavaScript objects.
 * A duration object can contain the following fields:
 *
 * ```
 * const duration = {
 *   weeks:...,
 *   days: ...,
 *   hours: ...,
 *   minutes: ...,
 *   seconds: ...,
 *   milliseconds: ...
 * };
 * ```
 *
 * In this library:
 *
 * * a *week* is always equal to *7 days*,
 * * a *day* is always equal to *24 hours*,
 * * an *hour* is always equal to *60 minutes*,
 * * a *minute* is always equal to *60 seconds*,
 * * a *second* is always equal to *1000 milliseconds*
 */
class ztime {
  constructor(time = Date.now()) {
    if (typeof(time) === "string")
      time = parseDateTime(time);

    this._time = +time;

    if (Number.isNaN(this._time)) {
      throw { message: "ZT014 Invalid value: "+time, what: time };
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

  toString() {
    return this.date.toISOString();
  }

  toJSON(_) {   // eslint-disable-line no-unused-vars
    return this.date.toISOString();
  }

  /**
   * Create a new event object by adding a duration to this.
   *
   * The duration is expressed as a *duration object*.
   *
   * @example
   * const event = new ztime();
   * event.plus({ hours: 2 }).wait().then(()=>{
   *   console.log("2 hours have passed");
   * });
   */
  plus(duration) {
    return new ztime(this._time + toMilliseconds(duration));
  }

  /**
   * Create a new event object by substracting a duration to this.
   *
   * The duration is expressed as a *duration object*.
   *
   * @example
   * const event = new ztime();
   * event.plus({ hours: 2 }).minus({ minutes: 15 }).wait().then(()=>{
   *   console.log("1 hours 45 has passed");
   * });
   */
  minus(duration) {
    return new ztime(this._time - toMilliseconds(duration));
  }

  /**
   * Add or subtract a random duration between 0 and `amplitude/2`
   *
   * The `amplitude` is expressed as a *duration object*.
   * In represents the amplitude between the minimum and maximum values of the result.
   */
  jitter(amplitude) {
    let milliseconds = toMilliseconds(amplitude);

    // Find a number between (-amplitudei/2;+amplitude/2) -- EXCLUSIVE on both sides
    let offset = 0;
    if (milliseconds) {
      while(offset == 0) {
        offset = Math.random()*milliseconds;
      }
    }
    offset -= milliseconds/2;

    return new ztime(this._time+offset);
  }

  /**
   * Return a promise that will be fulfilled at this event's date-time.
   */
  wait() {
    const time = this;

    return Promise.delay(time-Date.now(), this);
  }

  /**
   * Return a promise that will be fulfilled at a later point in time.
   *
   * At the date-time of this event, the `fn` callback is called.
   * It may postpone the promise completion by calling the `next` callback
   * parameter.
   *
   */
  loop(fn) {
    let schedule = this;
    const coroutine = Promise.coroutine(function*() {
      let doItAgain = true;
      let result = undefined;

      function next(date) {
        if (date)
          schedule = date;

        doItAgain = true;
      }

      while(doItAgain) {
        doItAgain = false;
        debug("Waiting for", schedule);
        yield schedule.wait();

        result = yield Promise.resolve(fn(schedule, next));
      }

      return result;
    });

    return coroutine();
  }
}

module.exports = function(date) {
  return new ztime(date);
};

module.exports.parseDateTime = parseDateTime;
