const { assert } = require('chai');
const nock = require('nock');
const request = require('request-promise-native');
const qs = require('querystring');
const TasuMock = require('./tasuMock');
const boot = require('../boot');
const { bonner } = require('@venture-api/fixtures/fixtures/player');
const w = require('@venture-api/fixtures/dictionary/words');
const t = require('@venture-api/fixtures/dictionary/topics');
const { rdrn, gawa } = require('@venture-api/fixtures/fixtures/facility');
const { ironOne } = require('@venture-api/fixtures/fixtures/resource');


let tasu;
let stair;
let baseURL;
let httpServer;
let factoryJWT;

before(async function ()  {
    try {
        const gate = await boot();
        tasu = gate.state.tasu;
        stair = gate.state.stair;
        httpServer = gate.state.httpServer;
        const { config: { http: { host, port }}} = gate.state;
        baseURL = `http://${host}:${port}`;
        TasuMock(tasu);
    } catch (error) {
        throw error;
    }
});

after(async function () {

    console.log('> stopping test server');
    httpServer.close();
    tasu.close();
    stair.close();
});

describe('endpoints', () => {

    describe('Status', () => {

        it('responds OK', async () => {
            const body = await request.get(`${baseURL}/status`);
            assert.equal(body, '{"mold":{"status":"ok","id":"MOLD-001"}}');
        });
    });

    describe('OAuth', () => {

        it('responds via mock strategy', async () => {
            nock('http://localhost:3000')
                .get('/login')
                .query(true)
                .reply(200);
            await stair.read('player.register', ({id, name, email}) => {
                assert.equal(email, bonner.email);
                assert.isOk(id);
                bonner.id = id;
                assert.equal(name, bonner.name);
            });
            const res = await request.get(`${baseURL}/oauth/mock`, {
                resolveWithFullResponse: true
            });
            assert.equal(res.request.uri.path, '/login?token=FAKEJWT');
        });
    });

    describe('Facility:Register', () => {

        it('throws if there is no authorization header', async () => {
            try {
                const res = await request.post(`${baseURL}/facilities`, {
                    json: rdrn,
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.equal(error.statusCode, 400);
                assert.equal(error.response.body.message, 'No authorization header');
            }
        });

        it('throws if there is no token', async () => {
            try {
                const res = await request.post(`${baseURL}/facilities`, {
                    json: rdrn,
                    headers: {
                        'Authorization': 'Basic YWxhZGRpbjpvcGVuc2VzYW1l'
                    },
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.equal(error.statusCode, 400);
                assert.equal(error.response.body.message, 'No authorization token');
            }
        });

        it('throws if token verification failed', async () => {
            try {
                const res = await request.post(`${baseURL}/facilities`, {
                    json: rdrn,
                    headers: {
                        'Authorization': 'Bearer BADTOKEN'
                    },
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.equal(error.statusCode, 400);
                assert.equal(error.response.body.message, 'Token verification failed');
            }
        });

        it('throws if token has no principal id', async () => {
            try {
                const res = await request.post(`${baseURL}/facilities`, {
                    json: rdrn,
                    headers: {
                        'Authorization': 'Bearer NOPRINCIPALTOKEN'
                    },
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.equal(error.statusCode, 400);
                assert.equal(error.response.body.message, 'No principal ID in token payload');
            }
        });

        it('creates a new factory', async () => {
            await stair.read(t.facilityCreated, ({ id, name, code, ownerId }) => {
                assert.equal(id, rdrn.id);
                assert.equal(name, rdrn.name);
                assert.equal(code, rdrn.code);
                assert.equal(ownerId, bonner.id);
            });

            const res = await request.post(`${baseURL}/facilities`, {
                json: rdrn,
                headers: { 'Authorization': `Bearer BONNERTOKEN` },
                resolveWithFullResponse: true
            });

            const { name, code, type, ownerId, id } = res.body;
            assert.equal(res.statusCode, 201);
            assert.equal(name, rdrn.name);
            assert.equal(code, rdrn.code);
            assert.equal(type, rdrn.type);
            assert.equal(ownerId, bonner.id);
            assert.equal(id, rdrn.id);
            assert.isOk(res.headers['x-guid']);
            factoryJWT = res.headers['x-token'];
            assert.isOk(factoryJWT);
        });

        it('responds with validation error', async () => {
            try {
                const res = await request.post(`${baseURL}/${w.facilities}`, {
                    json: {name: 'Bad Factory'},
                    headers: {
                        'Authorization': `Bearer BONNERTOKEN`
                    },
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.equal(error.statusCode, 400);
                assert.equal(error.response.body.message, `Missing 'type'`);
            }
        })
    });

    describe('Facility:Resource:Produce', () => {

        it('creates a new resource', async () => {
            await stair.read('createResource', ({ id, location, defects, ownerId }) => {
                assert.equal(location, rdrn.id);
                assert.deepEqual(defects, ironOne.defects);
                assert.equal(ownerId, bonner.id);
                ironOne.id = id;
                assert.isOk(id);
            });
            const res = await request.post(`${baseURL}/resources`, {
                json: true,
                headers: {
                    'Authorization': `Bearer RDRNTOKEN`
                },
                resolveWithFullResponse: true
            });
            assert.equal(res.statusCode, 201);
            const {id, location, defects, ownerId, producedAt} = res.body;
            assert.equal(id, ironOne.id);
            assert.equal(location, rdrn.id);
            assert.equal(producedAt, rdrn.id);
            assert.equal(defects.length, 1);
            assert.equal(ownerId, bonner.id);
            assert.isOk(res.headers['x-guid']);
        })

    });

    describe('Transport Resource', () => {

        it('transports a resource from one location to another', async () => {
            await stair.read('transportResource', ({id, location}) => {
                assert.equal(location, gawa.id);
            });
            const res = await request.patch(`${baseURL}/resources/${ironOne.id}`, {
                json: {location: gawa.id},
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoiZmFjaWxpdHkiLCJpIjoiRkEtVURIUlNCT1dWRTMxTzEtVFIiLCJpYXQiOjE1MzA5MTM2OTJ9.4WIHZwunKM3ezVqVOAgRSCcps8nMoRZyj8lPGDqPUak`
                },
                resolveWithFullResponse: true
            });
            assert.equal(res.statusCode, 204);
            assert.isOk(res.headers['x-guid']);
        })

    });
});
