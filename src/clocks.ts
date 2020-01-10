export interface Clock<T> {
    start(): T;
    diff(start: T): number;
}

export const CLOCKS = {
    ms: {
        start() {
            return Date.now();
        },
        diff(start: number) {
            return Date.now() - start;
        },
    } as Clock<number>,
    hr: {
        start() {
            return process.hrtime();
        },
        diff(start: [number, number]) {
            const [seconds, nanos] = process.hrtime(start);
            // Convert to milliseconds
            return seconds * 1000 + nanos / 1000000;
        },
    } as Clock<[number, number]>,
};
