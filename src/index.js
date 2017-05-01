import onHeaders from 'on-headers';

const CLOCKS = {
    ms: {
        start() {return Date.now();},
        diff(start) {return Date.now() - start;}
    },
    hr: {
        start() {return process.hrtime();},
        diff(start) {
            const [seconds, nanos] = process.hrtime(start);
            // Convert to milliseconds
            return (seconds * 1000) + (nanos / 1000000);
        }
    }
};


/**
 * Keeps track of timing data for events and turns that data into a `server-timing` header.
 */
class Timer {
    constructor(options={}) {
        this._isDummy = options.isDummy;
        this._clock = options.clock;
        this._records = {};
    }

    /**
     * Start timing an event.
     * @param {string} slug - The slug to use for timing.  The same slug must be supplied to `end(slug)` in order
     *   for this timing to show up in the final header.
     * @param {string} [label] - Label to use in the server-timing header.
     */
    start(slug, label=null) {
        if(this._isDummy) {return;}
        if(this._records[slug]) {
            console.error(`serverTime: Attempting to add slug we've already seen ${slug}`);
        } else {
            this._records[slug] = {
                label: label || slug,
                start: this._clock.start()
            };
        }
    }

    /**
     * Stop timing an event.
     * @param {string} slug - The slug to supplied to `start()`.
     */
    end(slug) {
        if(this._isDummy) {return;}
        const record = this._records[slug];
        if(record) {
            record.time = this._clock.diff(record.start);
        }
    }

    /**
     * Set the timing for an event.
     * @param {string} slug - The slug to use for timing.
     * @param {string} [label] - Label to use in the server-timing header.
     * @param {number} ms - Time, in milliseconds.  Can be a float.
     */
    setTime(slug, label, ms) {
        if(ms === undefined) {
            ms = label;
            label = null;
        }

        this._records[slug] = {
            label: label || slug,
            time: ms
        };
    }

    /**
     * Time the duration of a promise.
     * @param {string} slug - The slug to use for timing.
     * @param {string} [label] - Label to use in the server-timing header.
     * @param {Promise} promise - The promise to time.
     * @return {Promise} - Returns the passed in `promise`.
     */
    timePromise(slug, label, promise) {
        if(!promise) {
            promise = label;
            label = slug;
        }

        if(!this._isDummy) {
            this.start(slug, label);
            promise.then(
                () => this.end(slug),
                () => this.end(slug)
            );
        }

        return promise;
    }

    /**
     * Return the server-timing header.
     * @return {string} - The header.
     */
    getHeader() {
        if(this._isDummy) {return null;}

        return Object.keys(this._records)
        // Filter out any results where we never called 'end'
        .filter(slug => 'time' in this._records[slug])
        .map(slug => `${slug}=${this._records[slug].time}; "${this._records[slug].label}"`)
        .join(', ');
    }
}

/**
 * Returns an express-style middleware that automatically adds `res.serverTiming` to the resposne object.
 *
 * @param  {Object} [options={}] - Options.
 * @param  {boolean} [options.devOnly=true] - If truthy, then only add a 'server-timing' header when NODE_ENV
 *   is not "production".  Server timing information can reveal a lot about your infrastructure to a potential
 *   attacker, so be careful with this.
 * @param  {string} [options.clock=hr] - The default is 'hr' which uses `process.hrtime()` to get nanosecond accuracy,
 *   but if you're on a platform that doesn't support `process.hrtime()` you can pass in 'ms' to use `Date.now()`
 *   instead.
 * @return {function} A `function(req, res, next)` express-style middleware.  Note that `next` is optional.
 */
export function middleware(options={}) {
    return function(req, res, next) {
        addToResponse(res, options);
        if(next) {next();}
    };
}

/**
 * Sets up a request to
 *
 * @param {http.ServerResponse} res - The resposne object.  `res.serverTiming` will be set to a new `Timer` object.
 *   `res.setHeader()` will automatically be called with the new header.
 * @param  {Object} [options={}] - Options.
 * @param  {boolean} [options.devOnly=true] - If truthy, then only add a 'server-timing' header when NODE_ENV
 *   is not "production".  Server timing information can reveal a lot about your infrastructure to a potential
 *   attacker, so be careful with this.
 * @param  {string} [options.clock] - The default is 'hr' which uses `process.hrtime()` to get nanosecond accuracy,
 *   but if you're on a platform that doesn't support `process.hrtime()` you can pass in 'ms' to use `Date.now()`
 *   instead.
 */
export function addToResponse(res, options={}) {
    const devOnly = ('devOnly' in options) ? options.devOnly : true;
    const clock = CLOCKS[options.clock || 'hr'];

    // Don't add this twice.
    if(res.serverTiming) {return;}

    // If we're not in production, then do nothing.  Add a `dummy` serverTiming so caller code doesn't
    // need to change.
    if(devOnly && process.env.NODE_ENV === 'production') {
        res.serverTiming = new Timer({isDummy: true, clock});
        return;
    }

    res.serverTiming = new Timer({clock});

    onHeaders(res, function() {
        if(!this.getHeader('server-timing')) {
            this.setHeader('server-timing', res.serverTiming.getHeader());
        }
    });
}


/**
 * Returns a mini-middleware that calls `res.serverTiming.start(slug, label)`.
 *
 * @param {string} slug - The slug to use for timing.  The same slug must be supplied to `end(slug)` in order
 *   for this timing to show up in the final header.
 * @param {string} [label] - Label to use in the server-timing header.
 * @return {function} - Middleware function.
 */
export function start(slug, label=null) {
    return (req, res, next) => {
        res.serverTiming.start(slug, label);
        if(next) {next();}
    };
}

/**
 * Returns a mini-middleware that calls `res.serverTiming.end(slug, label)`.
 *
 * @param {string} slug - The slug to supplied to `start()`.
 * @return {function} - Middleware function.
 */
export function end(slug) {
    return (req, res, next) => {
        res.serverTiming.end(slug);
        if(next) {next();}
    };
}

/**
 * Wraps a middleware and adds timing data for it to the server-timing header.
 *
 * @param {string} slug - The slug to use for timing.
 * @param {string} [label] - Label to use in the server-timing header.
 * @param {function} middleware - The `fn(req, res, next)` function to time.  Note that the function must call
 *   `next()` in order to be timed.
 * @return {function} - Middleware function.
 */
export function timeMiddleware(slug, label, middleware) {
    if(!middleware) {
        middleware = label;
        label = slug;
    }

    return (req, res, next) => {
        res.serverTiming.start(slug, label);
        middleware(req, res, err => {
            res.serverTiming.end(slug);
            next(err);
        });
    };
}

/**
 * Create a new Timer object.
 * @param  {object} [options={}] - Options.
 * @param  {string} [options.clock=hr] - The default is 'hr' which uses `process.hrtime()` to get nanosecond accuracy,
 *   but if you're on a platform that doesn't support `process.hrtime()` you can pass in 'ms' to use `Date.now()`
 *   instead.
 * @return {Timer} - New Timer object.
 */
export function createTimer(options={}) {
    const clock = CLOCKS[options.clock || 'hr'];
    return new Timer({clock});
}
