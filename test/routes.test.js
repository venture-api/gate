const {assert} = require('chai');
const nock = require('nock');
const request = require('request-promise-native');
const qs = require('querystring');
const appReady = require('../app');
const TasuMock = require('./tasuMock');
const {playerOne, factoryOne} = require('./fixtures');


let tasu;
let stair;
let entrypoint;
let server;
let playerJWT;

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
            stair.read('player.register', ({id, name, email}) => {
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
                stair.read('factory.create', ({id, name, code, type, ownerId}) => {
                    assert.equal(name, factoryOne.name);
                    assert.equal(code, factoryOne.code);
                    assert.equal(type, factoryOne.type);
                    assert.equal(ownerId, playerOne.id);
                    assert.isOk(id);
                });
                const res = await request.post(`${entrypoint}/factories`, {
                    json: factoryOne,
                    headers: {
                        'Authorization': `Bearer ${playerJWT}`
                    },
                    resolveWithFullResponse: true
                });
                const newFactory = res.body;
                assert.equal(newFactory.name, factoryOne.name);
                assert.equal(newFactory.code, factoryOne.code);
                assert.equal(newFactory.type, factoryOne.type);
                assert.equal(newFactory.ownerId, playerOne.id);
                assert.isOk(newFactory.id);
                assert.isOk(res.headers['x-guid']);
            })

        });

    });


});