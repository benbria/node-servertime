import express from 'express';
import sinon from 'sinon';
import { makeFetch } from 'supertest-fetch';
import servertime from '../src';

describe('start and end', function() {
    let clock: sinon.SinonFakeTimers;

    beforeEach(function() {
        clock = sinon.useFakeTimers();
    });

    afterEach(function() {
        clock.restore();
    });

    it('should time a call', async function() {
        const app = express();
        app.use(servertime.middleware({ devOnly: true }));
        app.get(
            '/hello',
            servertime.start('a'),
            (_req, _res, next) => {
                clock.tick(10);
                next();
            },
            servertime.end('a'),
            (_req, res) => res.send('done')
        );

        const fetch = makeFetch(app);
        await fetch('/hello').expectHeader('Server-Timing', 'a;dur=10');
    });

    it('should optionally include description', async function() {
        const app = express();
        app.use(servertime.middleware({ devOnly: true }));
        app.get(
            '/hello',
            servertime.start('a', 'the thing'),
            (_req, _res, next) => {
                clock.tick(10);
                next();
            },
            servertime.end('a'),
            (_req, res) => res.send('done')
        );

        const fetch = makeFetch(app);
        await fetch('/hello').expectHeader('Server-Timing', 'a;desc="the thing";dur=10');
    });

    it('should set multiple timers', async function() {
        const app = express();
        app.use(servertime.middleware({ devOnly: true }));
        app.get(
            '/hello',
            servertime.start('a', 'the thing'),
            (_req, _res, next) => {
                clock.tick(10);
                next();
            },
            servertime.end('a'),
            servertime.start('b', 'other thing'),
            (_req, _res, next) => {
                clock.tick(1);
                next();
            },
            servertime.end('b'),
            (_req, res) => res.send('done')
        );

        const fetch = makeFetch(app);
        await fetch('/hello').expectHeader(
            'Server-Timing',
            'a;desc="the thing";dur=10, b;desc="other thing";dur=1'
        );
    });
});
