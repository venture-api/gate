const {assert} = require('chai');
const nock = require('nock');
const request = require('request-promise-native');
const qs = require('querystring');
const TasuMock = require('./tasuMock');
const Bootstrap = require('../bootstrap');
const {bonner} = require('@venture-api/fixtures/fixtures/player');
const {rdrn, gawa} = require('@venture-api/fixtures/fixtures/facility');
const {ironOne} = require('@venture-api/fixtures/fixtures/resource');


let tasu;
let stair;
let entrypoint;
let httpServer;
let playerJWT;
let factoryJWT;

before(async function ()  {
    try {
        const gate = await Bootstrap();
        tasu = gate.get('tasu');
        stair = gate.get('stair');
        httpServer = gate.get('httpServer');
        const {http: {host, port}} = gate.get('config');
        entrypoint = `http://${host}:${port}`;
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

describe('modules', () => {

    describe('middleware', () => {

        describe('authorize', () => {

            it('throws if there is no authorization header', async () => {
                try {
                    const res = await request.post(`${entrypoint}/facilities`, {
                        json: rdrn,
                        resolveWithFullResponse: true
                    });
                    assert.isUndefined(res);
                } catch (error) {
                    assert.equal(error.statusCode, 400);
                    assert.equal(error.response.body.message, `no authorization header`);
                    assert.equal(error.response.body.error, `Bad Request`);
                }
            });

            it('throws if there is no token', async () => {
                try {
                    const res = await request.post(`${entrypoint}/facilities`, {
                        json: rdrn,
                        headers: {
                            'Authorization': 'Basic YWxhZGRpbjpvcGVuc2VzYW1l'
                        },
                        resolveWithFullResponse: true
                    });
                    assert.isUndefined(res);
                } catch (error) {
                    assert.equal(error.statusCode, 400);
                    assert.equal(error.response.body.message, 'no authorization token');
                    assert.equal(error.response.body.error, 'Bad Request');
                }
            });

            it('throws if token verification failed', async () => {
                try {
                    const res = await request.post(`${entrypoint}/facilities`, {
                        json: rdrn,
                        headers: {
                            'Authorization': 'Bearer YWxhZGRpbjpvcGVuc2VzYW1l'
                        },
                        resolveWithFullResponse: true
                    });
                    assert.isUndefined(res);
                } catch (error) {
                    assert.equal(error.statusCode, 400);
                    assert.equal(error.response.body.message, 'token verification failed');
                    assert.equal(error.response.body.error, 'Bad Request');
                }
            });

            it('throws if token has no principal id', async () => {
                try {
                    const res = await request.post(`${entrypoint}/facilities`, {
                        json: rdrn,
                        headers: {
                            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsIn' +
                            'R5cCI6IkpXVCJ9.eyJ0IjoicGxheWVyIiwiaWF0IjoxNTI' +
                            '5NjExODA4fQ._ZLGTOs-OmCwTVdyqv2mxyS3PqXWQsPKyj' +
                            'OihzCvbYo'
                        },
                        resolveWithFullResponse: true
                    });
                    assert.isUndefined(res);
                } catch (error) {
                    assert.equal(error.statusCode, 400);
                    assert.equal(error.response.body.message, 'no id in token payload');
                    assert.equal(error.response.body.error, 'Bad Request');
                }
            });
        });
    });
});

describe('endpoints', () => {

    describe('Get Status', () => {

        it('responds OK', async () => {
            const body = await request.get(`${entrypoint}/status`);
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
            const res = await request.get(`${entrypoint}/oauth/mock`, {
                resolveWithFullResponse: true
            });
            assert.include(res.request.uri.path, '/login?token=eyJ');
            playerJWT = qs.parse(res.request.uri.query).token;
        });
    });

    describe('Create Factory', () => {

        it('creates a new factory', async () => {
            await stair.read('factory.create', ({id, name, code, type, ownerId}) => {
                assert.equal(name, rdrn.name);
                assert.equal(code, rdrn.code);
                assert.equal(type, rdrn.type);
                assert.equal(ownerId, bonner.id);
                rdrn.id = id;
                assert.isOk(id);
            });
            const res = await request.post(`${entrypoint}/facilities`, {
                json: rdrn,
                headers: {
                    'Authorization': `Bearer ${playerJWT}`
                },
                resolveWithFullResponse: true
            });
            const {name, code, type, ownerId, id} = res.body;
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
                const res = await request.post(`${entrypoint}/facilities`, {
                    json: {name: 'Bad Factory'},
                    headers: {
                        'Authorization': `Bearer ${playerJWT}`
                    },
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.equal(error.statusCode, 400);
                assert.equal(error.response.body.message, `body should have required property 'code'`);
                assert.equal(error.response.body.error, `Bad Request`);
            }

        })
    });

    describe('Create Resource', () => {

        it('creates a new resource', async () => {
            await stair.read('createResource', ({id, location, units, defects, ownerId}) => {
                assert.equal(location, rdrn.id);
                assert.deepEqual(defects, ironOne.defects);
                assert.equal(ownerId, bonner.id);
                ironOne.id = id;
                assert.isOk(id);
            });
            const res = await request.post(`${entrypoint}/resources`, {
                json: true,
                headers: {
                    'Authorization': `Bearer ${factoryJWT}`
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
            const res = await request.patch(`${entrypoint}/resources/${ironOne.id}`, {
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
