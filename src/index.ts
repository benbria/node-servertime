import http from 'http';
import onHeaders from 'on-headers';
import { CLOCKS } from './clocks';
import ServerTiming from './Timer';

export { ServerTiming };

declare module 'http' {
    interface ServerResponse {
        serverTiming: ServerTiming;
    }
}

export interface ServertimeOptions {
    /**
     * If truthy, then only add a 'server-timing' header when NODE_ENV is not
     * "production".  Server timing information can reveal a lot about your
     * infrastructure to a potential attacker, so be careful with this.  Defaults
     * to `true`.
     */
    devOnly?: boolean;

    /**
     * The clock to use.  `hr` is the default, high resoltuion timer.  `ms`
     * will use a lower millisecond resolution timer.
     */
    clock?: keyof typeof CLOCKS;
}

interface Middleware {
    (req: http.IncomingMessage, res: http.ServerResponse, next: (err?: Error) => void): void;
}

/**
 * Returns an express-style middleware that automatically adds `res.serverTiming` to the resposne object.
 */
export function middleware(options: ServertimeOptions = {}): Middleware {
    return function(_req, res, next) {
        addToResponse(res, options);
        if (next) {
            next();
        }
    };
}

/**
 * Adds a `res.serverTiming` to the specified response.
 *
 * @param res - The resposne object.  `res.serverTiming` will be set to a new `Timer` object.
 *   `res.setHeader()` will automatically be called with the new header.
 * @param [options={}] - Options.
 */
export function addToResponse(res: http.ServerResponse, options: ServertimeOptions = {}) {
    const devOnly = 'devOnly' in options ? options.devOnly : true;
    const clock = CLOCKS[options.clock || 'hr'];

    // Don't add this twice.
    if (res.serverTiming) {
        return;
    }

    // If we're not in production, then do nothing.  Add a `dummy` serverTiming so caller code doesn't
    // need to change.
    if (devOnly && process.env.NODE_ENV === 'production') {
        res.serverTiming = new ServerTiming({ isDummy: true, clock });
        return;
    }

    res.serverTiming = new ServerTiming({ clock });

    onHeaders(res, function() {
        const header = res.serverTiming.getHeader();
        if (header && !this.getHeader('server-timing')) {
            this.setHeader('server-timing', header);
        }
    });
}

/**
 * Returns a mini-middleware that calls `res.serverTiming.start(slug, label)`.
 *
 * @param slug - The slug to use for timing.  The same slug must be supplied to `end(slug)` in order
 *   for this timing to show up in the final header.
 * @param [label] - Label to use in the server-timing header.
 * @return - Middleware function.
 */
export function start(slug: string, label?: string): Middleware {
    return (_req, res, next) => {
        res.serverTiming.start(slug, label);
        if (next) {
            next();
        }
    };
}

/**
 * Returns a mini-middleware that calls `res.serverTiming.end(slug, label)`.
 *
 * @param slug - The slug to supplied to `start()`.
 * @return - Middleware function.
 */
export function end(slug: string): Middleware {
    return (_req, res, next) => {
        res.serverTiming.end(slug);
        if (next) {
            next();
        }
    };
}

/**
 * Wraps a middleware and adds timing data for it to the server-timing header.
 *
 * @param slug - The slug to use for timing.
 * @param middleware - The `fn(req, res, next)` function to time.  Note that the function must call
 *   `next()` in order to be timed.
 * @return - Middleware function.
 */
export function timeMiddleware(slug: string, middleware: Middleware): Middleware;

/**
 * Wraps a middleware and adds timing data for it to the server-timing header.
 *
 * @param slug - The slug to use for timing.
 * @param label - Label to use in the server-timing header.
 * @param middleware - The `fn(req, res, next)` function to time.  Note that the function must call
 *   `next()` in order to be timed.
 * @return - Middleware function.
 */
export function timeMiddleware(slug: string, label: string, middleware: Middleware): Middleware;

export function timeMiddleware(slug: string, l: string | Middleware, mw?: Middleware): Middleware {
    const middleware = mw || (l as Middleware);
    const label = mw ? (l as string) : slug;

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
 * @param [options={}] - Options.
 * @param [options.clock=hr] - The default is 'hr' which uses `process.hrtime()` to get nanosecond accuracy,
 *   but if you're on a platform that doesn't support `process.hrtime()` you can pass in 'ms' to use `Date.now()`
 *   instead.
 * @return - New Timer object.
 */
export function createTimer(options: { clock?: keyof typeof CLOCKS } = {}) {
    const clock = CLOCKS[options.clock || 'hr'];
    return new ServerTiming({ clock });
}

export default {
    middleware,
    addToResponse,
    start,
    end,
    timeMiddleware,
    createTimer,
};
