## Classes

<dl>
<dt><a href="#Timer">Timer</a></dt>
<dd><p>Keeps track of timing data for events and turns that data into a <code>server-timing</code> header.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#middleware">middleware([options])</a> ⇒ <code>function</code></dt>
<dd><p>Returns an express-style middleware that can be used to add a &#39;server-timing&#39; header to the response.</p>
</dd>
<dt><a href="#addToRequest">addToRequest(req, res, [options])</a> ⇒ <code>undefined</code></dt>
<dd><p>Sets up a request to</p>
</dd>
<dt><a href="#start">start(slug, [label])</a> ⇒ <code>function</code></dt>
<dd><p>Returns a mini-middleware that calls <code>res.serverTiming.start(slug, label)</code>.</p>
</dd>
<dt><a href="#end">end(slug)</a> ⇒ <code>function</code></dt>
<dd><p>Returns a mini-middleware that calls <code>res.serverTiming.end(slug, label)</code>.</p>
</dd>
<dt><a href="#timeMiddleware">timeMiddleware(slug, [label], middleware)</a> ⇒ <code>function</code></dt>
<dd><p>Wraps a middleware and adds timing data for it to the server-timing header.</p>
</dd>
<dt><a href="#createTimer">createTimer()</a> ⇒ <code><a href="#Timer">Timer</a></code></dt>
<dd><p>Create a new Timer object.</p>
</dd>
</dl>

<a name="Timer"></a>

## Timer
Keeps track of timing data for events and turns that data into a `server-timing` header.

**Kind**: global class  

* [Timer](#Timer)
    * [.start(slug, [label])](#Timer+start) ⇒ <code>undefined</code>
    * [.end(slug)](#Timer+end) ⇒ <code>undefined</code>
    * [.setTime(slug, [label], ms)](#Timer+setTime) ⇒ <code>undefined</code>
    * [.timePromise(slug, [label], promise)](#Timer+timePromise) ⇒ <code>undefined</code>
    * [.getHeader()](#Timer+getHeader) ⇒ <code>string</code>

<a name="Timer+start"></a>

### timer.start(slug, [label]) ⇒ <code>undefined</code>
Start timing an event.

**Kind**: instance method of [<code>Timer</code>](#Timer)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| slug | <code>string</code> |  | The slug to use for timing.  The same slug must be supplied to `end(slug)` in order   for this timing to show up in the final header. |
| [label] | <code>string</code> | <code>null</code> | Label to use in the server-timing header. |

<a name="Timer+end"></a>

### timer.end(slug) ⇒ <code>undefined</code>
Stop timing an event.

**Kind**: instance method of [<code>Timer</code>](#Timer)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug to supplied to `start()`. |

<a name="Timer+setTime"></a>

### timer.setTime(slug, [label], ms) ⇒ <code>undefined</code>
Set the timing for an event.

**Kind**: instance method of [<code>Timer</code>](#Timer)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug to use for timing. |
| [label] | <code>string</code> | Label to use in the server-timing header. |
| ms | <code>number</code> | Time, in milliseconds.  Can be a float. |

<a name="Timer+timePromise"></a>

### timer.timePromise(slug, [label], promise) ⇒ <code>undefined</code>
Time the duration of a promise.

**Kind**: instance method of [<code>Timer</code>](#Timer)  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug to use for timing. |
| [label] | <code>string</code> | Label to use in the server-timing header. |
| promise | <code>Promise</code> | The promise to time. |

<a name="Timer+getHeader"></a>

### timer.getHeader() ⇒ <code>string</code>
Return the server-timing header.

**Kind**: instance method of [<code>Timer</code>](#Timer)  
**Returns**: <code>string</code> - - The header.  
<a name="middleware"></a>

## middleware([options]) ⇒ <code>function</code>
Returns an express-style middleware that can be used to add a 'server-timing' header to the response.

**Kind**: global function  
**Returns**: <code>function</code> - A `function(req, res, next)` express-style middleware.  Note that `next` is optional.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | Options. |
| [options.devOnly] | <code>boolean</code> | <code>true</code> | If truthy, then only add a 'server-timing' header when NODE_ENV   is not "production".  Server timing information can reveal a lot about your infrastructure to a potential   attacker, so be careful with this. |
| [options.clock] | <code>string</code> |  | The default is 'hr' which uses `process.hrtime()` to get nanosecond accuracy,   but if you're on a platform that doesn't support `process.hrtime()` you can pass in 'ms' to use `Date.now()`   instead. |

<a name="addToRequest"></a>

## addToRequest(req, res, [options]) ⇒ <code>undefined</code>
Sets up a request to

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>http.IncomingMessage</code> |  | The request object.  `req.serverTiming` will be set to a new `Timer` object. |
| res | <code>http.ServerResponse</code> |  | The resposne object.  `res.setHeader()` will automatically be called with the   new header. |
| [options] | <code>Object</code> | <code>{}</code> | Options. |
| [options.devOnly] | <code>boolean</code> | <code>true</code> | If truthy, then only add a 'server-timing' header when NODE_ENV   is not "production".  Server timing information can reveal a lot about your infrastructure to a potential   attacker, so be careful with this. |
| [options.clock] | <code>string</code> |  | The default is 'hr' which uses `process.hrtime()` to get nanosecond accuracy,   but if you're on a platform that doesn't support `process.hrtime()` you can pass in 'ms' to use `Date.now()`   instead. |

<a name="start"></a>

## start(slug, [label]) ⇒ <code>function</code>
Returns a mini-middleware that calls `res.serverTiming.start(slug, label)`.

**Kind**: global function  
**Returns**: <code>function</code> - - Middleware function.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug to use for timing.  The same slug must be supplied to `end(slug)` in order   for this timing to show up in the final header. |
| [label] | <code>string</code> | Label to use in the server-timing header. |

<a name="end"></a>

## end(slug) ⇒ <code>function</code>
Returns a mini-middleware that calls `res.serverTiming.end(slug, label)`.

**Kind**: global function  
**Returns**: <code>function</code> - - Middleware function.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug to supplied to `start()`. |

<a name="timeMiddleware"></a>

## timeMiddleware(slug, [label], middleware) ⇒ <code>function</code>
Wraps a middleware and adds timing data for it to the server-timing header.

**Kind**: global function  
**Returns**: <code>function</code> - - Middleware function.  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug to use for timing. |
| [label] | <code>string</code> | Label to use in the server-timing header. |
| middleware | <code>function</code> | The `fn(req, res, next)` function to time.  Note that the function must call   `next()` in order to be timed. |

<a name="createTimer"></a>

## createTimer() ⇒ [<code>Timer</code>](#Timer)
Create a new Timer object.

**Kind**: global function  
**Returns**: [<code>Timer</code>](#Timer) - - New Timer object.  
