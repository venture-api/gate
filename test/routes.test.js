const {assert} = require('chai');
const nock = require('nock');
const request = require('request-promise-native');
const qs = require('querystring');
const TasuMock = require('./tasuMock');
const {players, factories, resources: {ironOne}} = require('@venture-api/fixtures');

const {bonner} = players;
const {rdrn} = factories;
let tasu;
let stair;
let entrypoint;
let server;
let playerJWT;
let factoryJWT;

before(async function ()  {

    const appReady = require('../app');
    const app = await appReady();
    tasu = app.get('tasu');
    stair = app.get('stair');
    server = app.get('server');
    const config = app.get('config');
    entrypoint = `http://${config.host}:${config.port}`;
    TasuMock(tasu);
    server.listen(config.port);
});

after(async function () {

    console.log('> stopping test server');
    server.close();
    tasu.close();
    stair.close();
});

describe('routes', () => {

    describe('/status', () => {

        it('responds OK', async () => {
            const body = await request.get(`${entrypoint}/status`);
            assert.equal(body, '{"mold":{"status":"ok","id":"MOLD-001"}}');
        });
    });

    describe('/auth/:service', () => {

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
            const res = await request.get(`${entrypoint}/auth/mock`, {
                resolveWithFullResponse: true
            });
            assert.include(res.request.uri.path, '/login?token=eyJ');
            playerJWT = qs.parse(res.request.uri.query).token;
        });
    });

    describe('/factories', () => {

        describe('POST', () => {

            it('creates a new factory', async () => {
                await stair.read('factory.create', ({id, name, code, type, ownerId}) => {
                    assert.equal(name, rdrn.name);
                    assert.equal(code, rdrn.code);
                    assert.equal(type, rdrn.type);
                    assert.equal(ownerId, bonner.id);
                    rdrn.id = id;
                    assert.isOk(id);
                });
                const res = await request.post(`${entrypoint}/factories`, {
                    json: rdrn,
                    headers: {
                        'Authorization': `Bearer ${playerJWT}`
                    },
                    resolveWithFullResponse: true
                });
                const {name, code, type, ownerId, id} = res.body;
                assert.equal(name, rdrn.name);
                assert.equal(code, rdrn.code);
                assert.equal(type, rdrn.type);
                assert.equal(ownerId, bonner.id);
                assert.equal(id, rdrn.id);
                assert.isOk(res.headers['x-guid']);
                factoryJWT = res.headers['x-token'];
                assert.isOk(factoryJWT);
            })
        });
    });

    describe('/resources', () => {

        describe('POST', () => {

            it.skip('creates a new resource', async () => {
                await stair.read('resource.create', ({id, location, units, defects, ownerId}) => {
                    assert.equal(location, rdrn.id);
                    assert.deepEqual(defects, ironOne.defects);
                    assert.equal(ownerId, bonner.id);
                    ironOne.id = id;
                    assert.isOk(id);
                });
                const res = await request.post(`${entrypoint}/resources`, {
                    headers: {
                        'Authorization': `Bearer ${factoryJWT}`
                    },
                    resolveWithFullResponse: true
                });
                const {id, location, defects, ownerId} = res.body;
                assert.equal(id, rdrn.id);
                assert.equal(location, rdrn.id);
                assert.equal(defects.length, 2);
                assert.equal(ownerId, bonner.id);
                assert.isOk(res.headers['x-guid']);
            })
        });
    });
});
