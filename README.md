Add 'server-timing' headers to your node.js server.

If you're wondering why this would be useful, go check out [this article](https://ma.ttias.be/server-timings-chrome-devtools/).

There are other libraries out there that do this, but this one is the best.  ;)

## Features:

* Sub-millisecond accuracy with `process.hrtime()`, but falls back to millisecond accuracy if you're on some weird
  platform that doesn't have `process.hrtime()`.
* No server-timing headers by default on prod.
* No dependencies on Express, but provides some handy middleware helpers if you're on Express.

## Documentation

See the [api docs here](https://github.com/benbria/node-servertime/blob/master/api.md).

## Examples:

```js
import servertime from 'servertime';

/* -- Use in express app -- */
const app = express();
app.use(servertime.middleware({devOnly: true}));

// Time some middlewares
app.use(servertime.start('prerouting'));
app.use(sessionMiddleware);
app.use(otherMiddleware);
app.use(servertime.stop('prerouting');

// Time a single middleware
app.use(servertime.timeMiddleware('routing', router));


/* -- Use in non-express app -- */
http.createServer((req, res) => {
    servertime.addToRequest(req, res, {devOnly: true});

    res.serverTiming.start('blah');
    // do some stuff
    res.serverTiming.end('blah');

    let pUser = getUserFromDb();
    pUser = res.serverTiming.timePromise('getuser', 'Get User', pUser);
    pUser.then(user => {
        // Header will be added automatically
        res.end('Done');
    });
});


/* -- Use standalone -- */
const serverTiming = servertime.createTimer();
serverTiming.start('blah', 'Timing of Blah');
// ...
serverTiming.end('blah');

const header = serverTiming.getHeader();
```
