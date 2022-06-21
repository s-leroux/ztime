<a name="ztime"></a>

## ztime
A moment in time expressed as milliseconds since Epoch UTC.

The constructor accept either a string parsed according to the custom
date-time minilanguage or a number of milliseconds since Epoch UTC.


### The date-time mini-language:

```
date-time-spec: origin WS+ (('+'|'-') offset)+

origin: '' | 'today' | 'now'
  | (hh:mmm | hh:mm:ss)
  | yyyy-mm-ddThh:mm:ssZ
  | ('sunday'| .. |'saturday')

offset: (hh:mm | hh:mm:ss)

```

When the date is not explicitly specified, events are create in the future.
So `ztime("monday")` is *next* monday (excl. today).

### Duration objects

Duration are expressed as JavaScript objects.
A duration object can contain the following fields:

```
const duration = {
  weeks:...,
  days: ...,
  hours: ...,
  minutes: ...,
  seconds: ...,
  milliseconds: ...
};
```

In this library:

* a *week* is always equal to *7 days*,
* a *day* is always equal to *24 hours*,
* an *hour* is always equal to *60 minutes*,
* a *minute* is always equal to *60 seconds*,
* a *second* is always equal to *1000 milliseconds*

**Kind**: global class  

* [ztime](#ztime)
    * [.plus()](#ztime+plus)
    * [.minus()](#ztime+minus)
    * [.jitter()](#ztime+jitter)
    * [.wait()](#ztime+wait)
    * [.loop()](#ztime+loop)

<a name="ztime+plus"></a>

### ztime.plus()
Create a new event object by adding a duration to this.

The duration is expressed as a *duration object*.

**Kind**: instance method of [<code>ztime</code>](#ztime)  
**Example**  
```js
const event = new ztime();
event.plus({ hours: 2 }).wait().then(()=>{
  console.log("2 hours have passed");
});
```
<a name="ztime+minus"></a>

### ztime.minus()
Create a new event object by substracting a duration to this.

The duration is expressed as a *duration object*.

**Kind**: instance method of [<code>ztime</code>](#ztime)  
**Example**  
```js
const event = new ztime();
event.plus({ hours: 2 }).minus({ minutes: 15 }).wait().then(()=>{
  console.log("1 hours 45 has passed");
});
```
<a name="ztime+jitter"></a>

### ztime.jitter()
Add or subtract a random duration between 0 and `amplitude/2`

The `amplitude` is expressed as a *duration object*.
In represents the amplitude between the minimum and maximum values of the result.

**Kind**: instance method of [<code>ztime</code>](#ztime)  
<a name="ztime+wait"></a>

### ztime.wait()
Return a promise that will be fulfilled at this event's date-time.

**Kind**: instance method of [<code>ztime</code>](#ztime)  
<a name="ztime+loop"></a>

### ztime.loop()
Return a promise that will be fulfilled at a later point in time.

At the date-time of this event, the `fn` callback is called.
It may postpone the promise completion by calling the `next` callback
parameter.

**Kind**: instance method of [<code>ztime</code>](#ztime)  
