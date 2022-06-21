atd
===

Promise-based timer utilities


[![Build Status](https://travis-ci.org/s-leroux/ztime.png?branch=master)](https://travis-ci.org/s-leroux/ztime)

## Installation

    npm install --save ztime

## Basic usage


```
    const ztime = require('ztime');

    ztime("16:00").wait().then(() => console.log('Tea time'));
```

The goal was to design a no-dependency library to perform simple date-time manipulation and
trigger timer events.

Principles:

* All dates and times are UTC!
* ECMAScript Epoch-basd. No leap seconds.
* Date-time objects are immutable.

The date-time specifier is understand a simple mini-language:

```
deta-time-spec: origin WS+ (('+'|'-') offset)+

origin: '' | 'today' | 'now'
      | (hh:mmm | hh:mm:ss)
      | yyyy-mm-ddThh:mm:ssZ
      | ('sunday'| .. |'saturday')

offset: (hh:mm | hh:mm:ss)
      
```

When the date is not explicitly specified, events are create in the future.
So `ztime("monday")` is *next* monday (excl. today).

## API

See [docs/api.md](./docs/api.md)


## Node version
Require NodeJS >= v10.0
Tested with v10.0 and v14.15
 
## License 

(The MIT License)

Copyright (c) 2018 [Sylvain Leroux](mailto:sylvain@chicoree.fr)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
