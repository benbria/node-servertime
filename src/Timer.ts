import { Clock } from './clocks';

interface TimeRecord {
    label: string;
    start?: any;
    time?: number;
}

interface TimerOptions {
    isDummy?: boolean;
    clock: Clock<any>;
}

/**
 * Keeps track of timing data for events and turns that data into a `server-timing` header.
 */
export default class Timer {
    /* We use a "dummy" timer which does nothing in production mode. */
    private _isDummy: boolean;
    private _clock: Clock<any>;
    private _records: { [slug: string]: TimeRecord };

    constructor(options: TimerOptions) {
        this._isDummy = options.isDummy || false;
        this._clock = options.clock;
        this._records = {};
    }

    /**
     * Start timing an event.
     * @param slug - The slug to use for timing.  The same slug must be supplied to `end(slug)` in order
     *   for this timing to show up in the final header.
     * @param [label] - Label to use in the server-timing header.
     */
    start(slug: string, label?: string) {
        if (this._isDummy) {
            return;
        }
        if (this._records[slug]) {
            console.error(`serverTime: Attempting to add slug we've already seen ${slug}`);
        } else {
            this._records[slug] = {
                label: label || slug,
                start: this._clock.start(),
            };
        }
    }

    /**
     * Stop timing an event.
     * @param slug - The slug to supplied to `start()`.
     */
    end(slug: string) {
        if (this._isDummy) {
            return;
        }
        const record = this._records[slug];
        if (record) {
            record.time = this._clock.diff(record.start);
        }
    }

    /**
     * Set the timing for an event.
     * @param slug - The slug to use for timing.
     * @param ms - Time, in milliseconds.  Can be a float.
     */
    setTime(slug: string, ms: number): void;

    /**
     * Set the timing for an event.
     * @param slug - The slug to use for timing.
     * @param label - Label to use in the server-timing header.
     * @param ms - Time, in milliseconds.  Can be a float.
     */
    setTime(slug: string, label: string, ms: number): void;

    setTime(slug: string, l: string | number, m?: number) {
        const ms = m ? m : (l as number);
        const label = m ? (l as string) : slug;

        this._records[slug] = {
            label,
            time: ms,
        };
    }

    /**
     * Time the duration of a promise.
     * @param slug - The slug to use for timing.
     * @param promise - The promise to time.
     * @return - Returns the passed in `promise`.
     */
    timePromise<T>(slug: string, promise: Promise<T>): Promise<T>;

    /**
     * Time the duration of a promise.
     * @param slug - The slug to use for timing.
     * @param label - Label to use in the server-timing header.
     * @param promise - The promise to time.
     * @return - Returns the passed in `promise`.
     */
    timePromise<T>(slug: string, label: string, promise: Promise<T>): Promise<T>;

    timePromise<T>(slug: string, l: string | Promise<T>, p?: Promise<T>) {
        const promise = p ? p : (l as Promise<T>);
        const label = p ? (l as string) : slug;

        if (!this._isDummy) {
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
        if (this._isDummy) {
            return null;
        }

        return (
            Object.keys(this._records)
                // Filter out any results where we never called 'end'
                .filter(slug => 'time' in this._records[slug])
                .map(slug => {
                    const record = this._records[slug];
                    if (!record.label || record.label === slug) {
                        return `${slug};dur=${this._records[slug].time}`;
                    } else {
                        return `${slug};desc="${this._records[slug].label}";dur=${this._records[slug].time}`;
                    }
                })
                .join(', ')
        );
    }
}
