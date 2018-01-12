const debug=require("debug")("tests:parseTimeSpec");

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

exports.parseTimeSpec = function(timespec) {
  for(let s of SPEC) {
    const m = timespec.match(s.re);
    debug("%s match %s: ", timespec, s.re, m);

    if (m)
        return s.f(m);
  }

  throw { message: "Parse error: "+timespec, what: timespec };
}

exports.wait = function(timespec) {
  
}
