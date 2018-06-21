const {assert} = require('chai');
const nock = require('nock');
const request = require('request-promise-native');
const qs = require('querystring');
const TasuMock = require('./tasuMock');
const Bootstrap = require('../bootstrap');
const {players, factories, resources: {ironOne}} = require('@venture-api/fixtures');


const {bonner} = players;
const {rdrn} = factories;
let tasu;
let stair;
let entrypoint;
let fastify;
let playerJWT;
let factoryJWT;

before(async function ()  {
    try {
        const gate = await Bootstrap();
        tasu = gate.get('tasu');
        stair = gate.get('stair');
        fastify = gate.get('fastify');
        const {http: {host, port}} = gate.get('config');
        entrypoint = `http://${host}:${port}`;
        TasuMock(tasu);
    } catch (error) {
        throw error;
    }
});

after(async function () {

    console.log('> stopping test server');
    fastify.close();
    tasu.close();
    stair.close();
});

describe('HTTP endpoints', () => {

    describe('GET /status', () => {

        it('responds OK', async () => {
            const body = await request.get(`${entrypoint}/status`);
            assert.equal(body, '{"mold":{"status":"ok","id":"MOLD-001"}}');
        });
    });

    describe('GET /oauth/:service', () => {

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

    describe('POST /factories', () => {

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
                const res = await request.post(`${entrypoint}/factories`, {
                    json: {name: 'Bad Factory'},
                    headers: {
                        'Authorization': `Bearer ${playerJWT}`
                    },
                    resolveWithFullResponse: true
                });
            } catch (error) {
                assert.equal(error.statusCode, 400);
                assert.equal(error.response.body.message, `body should have required property 'code'`);
                assert.equal(error.response.body.error, `Bad Request`);
            }

        })
    });

    describe('POST /resources', () => {

        it('creates a new resource', async () => {
            await stair.read('resource.create', ({id, location, units, defects, ownerId}) => {
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
});
