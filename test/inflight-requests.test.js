/* eslint-disable prefer-destructuring */

const { expect } = require('chai');
const express = require('express');
const request = require('superagent');
const middleware = require('../index');

const getApp = (inflight) => {
    const app = express();
    app.use(inflight);

    app.get('/500ms', (req, res) => {
        setTimeout(() => res.status(200).json({ status: 'OK' }), 500);
    });

    app.get('/1s', (req, res) => {
        setTimeout(() => res.status(200).json({ status: 'OK' }), 1000);
    });

    app.get('/abort', (req, res) => {
        res.socket.destroy(new Error('bum!'));
    });

    return app;
};

describe('inflightRequests', function () {
    let app;
    let port;
    let server;
    let inflight;
    this.timeout(5000);

    beforeEach((done) => {
        inflight = middleware();
        app = getApp(inflight);
        server = app.listen(0, () => {
            port = server.address().port;
            expect(inflight.requestsCount()).to.equal(0);
            done();
        });
    });

    afterEach((done) => {
        server.close(() => {
            expect(inflight.requestsCount()).to.equal(0);
            done();
        });
    });

    it('should count inflight requests', (done) => {
        const url = `http://127.0.0.1:${port}/1s`;

        Array(3).fill(url).map(u => request.get(u).end());

        setTimeout(() => {
            expect(inflight.requestsCount()).to.equal(3);
            done();
        }, 10);
    });

    it('should decrement on client abort', (done) => {
        const url = `http://127.0.0.1:${port}/1s`;

        const clients = Array(3).fill(null).map(() => {
            const req = request.get(url);
            req.end();
            return req;
        });

        setTimeout(() => clients[0].abort(), 10);

        setTimeout(() => {
            expect(inflight.requestsCount()).to.equal(2);
            done();
        }, 100);
    });

    it('should decrement on server abort', (done) => {
        const baseUrl = `http://127.0.0.1:${port}`;
        const url = `${baseUrl}/1s`;

        Array(3).fill(url).map(u => request.get(u).end());
        request.get(`${baseUrl}/abort`).end();

        setTimeout(() => {
            expect(inflight.requestsCount()).to.equal(3);
            done();
        }, 10);
    });

    it('should increment and decrement inflight requests', (done) => {
        const baseUrl = `http://127.0.0.1:${port}`;
        const url = `${baseUrl}/1s`;

        request.get(`${baseUrl}/500ms`).end();
        Array(3).fill(url).map(u => request.get(u).end());

        setTimeout(() => {
            expect(inflight.requestsCount()).to.equal(4);
            setTimeout(() => {
                expect(inflight.requestsCount()).to.equal(3);
                done();
            }, 550);
        }, 10);
    });

    it('should mutate context parameter, if provided', (done) => {
        const context = {};
        const inflightLocal = middleware(context);
        const localApp = getApp(inflightLocal);

        const localServer = localApp.listen(0, () => {
            const localPort = localServer.address().port;
            const url = `http://127.0.0.1:${localPort}/1s`;

            expect(inflightLocal.requestsCount()).to.equal(0);
            expect(inflightLocal.requestsCount()).to.equal(context.inflightRequests);

            Array(3).fill(url).map(u => request.get(u).end());

            setTimeout(() => {
                expect(inflightLocal.requestsCount()).to.equal(3);
                expect(inflightLocal.requestsCount()).to.equal(context.inflightRequests);

                localServer.close(() => {
                    expect(inflightLocal.requestsCount()).to.equal(0);
                    expect(inflightLocal.requestsCount()).to.equal(context.inflightRequests);
                    done();
                });
            }, 10);
        });
    });
});