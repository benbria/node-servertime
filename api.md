# [servertime](https://github.com/benbria/node-servertime#readme) *2.0.2*

> Add server-timing header to your node.js app, with nanosecond precision.


### src/index.js


#### new Timer() 

Keeps track of timing data for events and turns that data into a `server-timing` header.






##### Returns


- `Void`



#### Timer.start(slug[, label]) 

Start timing an event.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| slug | `string`  | - The slug to use for timing. The same slug must be supplied to `end(slug)` in order   for this timing to show up in the final header. | &nbsp; |
| label | `string`  | - Label to use in the server-timing header. | *Optional* |




##### Returns


- `Void`



#### Timer.end(slug) 

Stop timing an event.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| slug | `string`  | - The slug to supplied to `start()`. | &nbsp; |




##### Returns


- `Void`



#### Timer.setTime(slug[, label], ms) 

Set the timing for an event.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| slug | `string`  | - The slug to use for timing. | &nbsp; |
| label | `string`  | - Label to use in the server-timing header. | *Optional* |
| ms | `number`  | - Time, in milliseconds. Can be a float. | &nbsp; |




##### Returns


- `Void`



#### Timer.timePromise(slug[, label], promise) 

Time the duration of a promise.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| slug | `string`  | - The slug to use for timing. | &nbsp; |
| label | `string`  | - Label to use in the server-timing header. | *Optional* |
| promise | `Promise`  | - The promise to time. | &nbsp; |




##### Returns


- `Promise`  - Returns the passed in `promise`.



#### Timer.getHeader() 

Return the server-timing header.






##### Returns


- `string`  - The header.



#### middleware([options&#x3D;{}]) 

Returns an express-style middleware that automatically adds `res.serverTiming` to the resposne object.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| options&#x3D;{} | `Object`  | - Options. | *Optional* |
| options.devOnly&#x3D;true | `boolean`  | - If truthy, then only add a 'server-timing' header when NODE_ENV   is not "production".  Server timing information can reveal a lot about your infrastructure to a potential
  attacker, so be careful with this. | *Optional* |
| options.clock&#x3D;hr | `string`  | - The default is 'hr' which uses `process.hrtime()` to get nanosecond accuracy,   but if you're on a platform that doesn't support `process.hrtime()` you can pass in 'ms' to use `Date.now()`
  instead. | *Optional* |




##### Returns


- `function`  A `function(req, res, next)` express-style middleware. Note that `next` is optional.



#### addToResponse(res[, options&#x3D;{}]) 

Sets up a request to




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| res | `http.ServerResponse`  | - The resposne object. `res.serverTiming` will be set to a new `Timer` object.   `res.setHeader()` will automatically be called with the new header. | &nbsp; |
| options&#x3D;{} | `Object`  | - Options. | *Optional* |
| options.devOnly&#x3D;true | `boolean`  | - If truthy, then only add a 'server-timing' header when NODE_ENV   is not "production".  Server timing information can reveal a lot about your infrastructure to a potential
  attacker, so be careful with this. | *Optional* |
| options.clock | `string`  | - The default is 'hr' which uses `process.hrtime()` to get nanosecond accuracy,   but if you're on a platform that doesn't support `process.hrtime()` you can pass in 'ms' to use `Date.now()`
  instead. | *Optional* |




##### Returns


- `Void`



#### start(slug[, label]) 

Returns a mini-middleware that calls `res.serverTiming.start(slug, label)`.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| slug | `string`  | - The slug to use for timing. The same slug must be supplied to `end(slug)` in order   for this timing to show up in the final header. | &nbsp; |
| label | `string`  | - Label to use in the server-timing header. | *Optional* |




##### Returns


- `function`  - Middleware function.



#### end(slug) 

Returns a mini-middleware that calls `res.serverTiming.end(slug, label)`.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| slug | `string`  | - The slug to supplied to `start()`. | &nbsp; |




##### Returns


- `function`  - Middleware function.



#### timeMiddleware(slug[, label], middleware) 

Wraps a middleware and adds timing data for it to the server-timing header.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| slug | `string`  | - The slug to use for timing. | &nbsp; |
| label | `string`  | - Label to use in the server-timing header. | *Optional* |
| middleware | `function`  | - The `fn(req, res, next)` function to time. Note that the function must call   `next()` in order to be timed. | &nbsp; |




##### Returns


- `function`  - Middleware function.



#### createTimer([options&#x3D;{}]) 

Create a new Timer object.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| options&#x3D;{} | `object`  | - Options. | *Optional* |
| options.clock&#x3D;hr | `string`  | - The default is 'hr' which uses `process.hrtime()` to get nanosecond accuracy,   but if you're on a platform that doesn't support `process.hrtime()` you can pass in 'ms' to use `Date.now()`
  instead. | *Optional* |




##### Returns


- `Timer`  - New Timer object.




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
