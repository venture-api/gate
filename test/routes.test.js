const {assert} = require('chai');
const nock = require('nock');
const request = require('request-promise-native');
const qs = require('querystring');
const appReady = require('../app');
const TasuMock = require('./tasuMock');
const {playerOne, factoryOne, resourceOne_} = require('./fixtures');


let tasu;
let stair;
let entrypoint;
let server;
let playerJWT;
let factoryJWT;

describe('routes', () => {

    before(async function ()  {

        const app = await appReady();
        tasu = app.get('tasu');
        stair = app.get('stair');
        server = app.get('server');
        const config = app.get('config');
        entrypoint = `http://${config.host}:${config.port}`;
        TasuMock(tasu);
        server.listen(config.port);
    });

    after(function (done) {
        console.log('> stopping test server');
        server.close();
        tasu.close();
        stair.close();
        done();
    });

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
                assert.equal(email, playerOne.email);
                assert.isOk(id);
                playerOne.id = id;
                assert.equal(name, playerOne.name);
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
                    assert.equal(name, factoryOne.name);
                    assert.equal(code, factoryOne.code);
                    assert.equal(type, factoryOne.type);
                    assert.equal(ownerId, playerOne.id);
                    factoryOne.id = id;
                    assert.isOk(id);
                });
                const res = await request.post(`${entrypoint}/factories`, {
                    json: factoryOne,
                    headers: {
                        'Authorization': `Bearer ${playerJWT}`
                    },
                    resolveWithFullResponse: true
                });
                const {name, code, type, ownerId, id} = res.body;
                assert.equal(name, factoryOne.name);
                assert.equal(code, factoryOne.code);
                assert.equal(type, factoryOne.type);
                assert.equal(ownerId, playerOne.id);
                assert.equal(id, factoryOne.id);
                assert.isOk(res.headers['x-guid']);
                factoryJWT = res.headers['x-token'];
                assert.isOk(factoryJWT);
            })

        });

    });

    describe('/resources', () => {

        describe('POST', () => {

            it('creates a new resource', async () => {
                await stair.read('resource.create', ({id, location, units, defects, ownerId}) => {
                    assert.equal(location, factoryOne.id);
                    assert.equal(defects, resourceOne_.defects);
                    assert.equal(ownerId, playerOne.id);
                    resourceOne_.id = id;
                    assert.isOk(id);
                });
                const res = await request.post(`${entrypoint}/resources`, {
                    headers: {
                        'Authorization': `Bearer ${factoryJWT}`
                    },
                    resolveWithFullResponse: true
                });
                const {id, location, defects, ownerId} = res.body;
                assert.equal(id, factoryOne.id);
                assert.equal(location, factoryOne.id);
                assert.equal(defects.length, 2);
                assert.equal(ownerId, playerOne.id);
                assert.isOk(res.headers['x-guid']);
            })

        });

    });


});