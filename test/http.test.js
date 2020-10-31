import assert from 'assert';
import nock from 'nock';
import request from 'request-promise-native';
import TasuMock from './tasuMock.js';
import boot from '../boot.js';
import w  from '@venture-api/fixtures/dictionary/words.js';
import t from '@venture-api/fixtures/dictionary/topics.js';
import pl from '@venture-api/fixtures/fixtures/players.js';
import fc from '@venture-api/fixtures/fixtures/facilities.js';
import rs from '@venture-api/fixtures/fixtures/resources.js';


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
            assert.strictEqual(body, '{"mold":{"status":"ok","id":"MOLD-001"}}');
        });
    });

    describe('OAuth', () => {

        it('responds via mock strategy', async () => {
            nock('http://localhost:3000')
                .get('/login')
                .query(true)
                .reply(200);
            await stair.read('player.register', ({id, name, email}) => {
                assert.strictEqual(email, pl.bonner.email);
                assert.ok(id);
                pl.bonner.id = id;
                assert.strictEqual(name, pl.bonner.name);
            });
            const res = await request.get(`${baseURL}/oauth/mock`, {
                resolveWithFullResponse: true
            });
            assert.strictEqual(res.request.uri.path, '/login?token=FAKEJWT');
        });
    });

    describe('Facility:Register', () => {

        it('throws if there is no authorization header', async () => {
            try {
                const res = await request.post(`${baseURL}/facilities`, {
                    json: fc.rdrn,
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.response.body, 'No authorization header');
            }
        });

        it('throws if there is no token', async () => {
            try {
                const res = await request.post(`${baseURL}/facilities`, {
                    json: fc.rdrn,
                    headers: {
                        'Authorization': 'Basic YWxhZGRpbjpvcGVuc2VzYW1l'
                    },
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.response.body, 'No authorization token');
            }
        });

        it('throws if token verification failed', async () => {
            try {
                const res = await request.post(`${baseURL}/facilities`, {
                    json: fc.rdrn,
                    headers: {
                        'Authorization': 'Bearer BADTOKEN'
                    },
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.response.body, 'Token verification failed');
            }
        });

        it('throws if token has no principal id', async () => {
            try {
                const res = await request.post(`${baseURL}/facilities`, {
                    json: fc.rdrn,
                    headers: {
                        'Authorization': 'Bearer NOPRINCIPALTOKEN'
                    },
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.response.body, 'No principal ID in token payload');
            }
        });

        it('creates a new factory', async () => {
            await stair.read(t.facilityCreated, ({ id, name, code, ownerId }) => {
                assert.strictEqual(id, fc.rdrn.id);
                assert.strictEqual(name, fc.rdrn.name);
                assert.strictEqual(code, fc.rdrn.code);
                assert.strictEqual(ownerId, pl.bonner.id);
            });

            const res = await request.post(`${baseURL}/facilities`, {
                json: fc.rdrn,
                headers: { 'Authorization': `Bearer BONNERTOKEN` },
                resolveWithFullResponse: true
            });

            const { name, code, type, ownerId, id } = res.body;
            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(name, fc.rdrn.name);
            assert.strictEqual(code, fc.rdrn.code);
            assert.strictEqual(type, fc.rdrn.type);
            assert.strictEqual(ownerId, pl.bonner.id);
            assert.strictEqual(id, fc.rdrn.id);
            assert.ok(res.headers['x-guid']);
            factoryJWT = res.headers['x-token'];
            assert.ok(factoryJWT);
        });

        it('responds with validation error', async () => {
            try {
                const res = await request.post(`${baseURL}/${w.facilities}`, {
                    json: { name: 'Bad Factory' },
                    headers: {
                        'Authorization': `Bearer BONNERTOKEN`
                    },
                    resolveWithFullResponse: true
                });
                assert.isUndefined(res);
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.response.body, `Missing 'type'`);
            }
        })
    });

    describe('Facility:Resource:Produce', () => {

        it('produces a new resource', async () => {
            await stair.read(t.resourceProduced, ({ id, locationId, defects, ownerId }) => {
                assert.strictEqual(locationId, fc.rdrn.id);
                assert.deepEqual(defects, rs.ironOne.defects);
                assert.strictEqual(ownerId, pl.bonner.id);
                rs.ironOne.id = id;
                assert.ok(id);
            });
            const res = await request.get(`${baseURL}/${w.resource}`, {
                json: true,
                headers: { 'Authorization': `Bearer RDRNTOKEN` },
                resolveWithFullResponse: true
            });
            assert.strictEqual(res.statusCode, 201);
            const { id, locationId, ownerId, originId, quality } = res.body;
            assert.strictEqual(id, rs.ironOne.id);
            assert.strictEqual(locationId, fc.rdrn.id);
            assert.strictEqual(originId, fc.rdrn.id);
            assert.strictEqual(quality, 80);
            assert.strictEqual(ownerId, pl.bonner.id);
            assert.ok(res.headers['x-guid']);
        })

    });

    describe('Transport Resource', () => {

        it('transports a resource from one location to another', async () => {
            await stair.read(t.transportOrdered, ({ id, resourceId, destinationId }) => {
                assert.ok(id);
                assert.strictEqual(resourceId, rs.ironOne.id);
                assert.strictEqual(destinationId, fc.gawa.id);
            });
            const res = await request.post(`${baseURL}/transport-orders`, {
                json: {
                    resourceId: rs.ironOne.id,
                    destinationId: fc.gawa.id
                },
                headers: {
                    'Authorization': 'Bearer BONNERTOKEN'
                },
                resolveWithFullResponse: true
            });
            assert.strictEqual(res.statusCode, 204);
            assert.ok(res.headers['x-guid']);
        })

    });
});
