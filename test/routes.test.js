const {assert} = require('chai');
const request = require('request-promise-native');
const appReady = require('../app');
const TasuMock = require('./tasuMock');


let tasu;
let stair;
let entrypoint;
let server;

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
            const res = await request.get(`${entrypoint}/status`);
            assert.equal(res, '{"mold":{"status":"ok"}}');
        });

    })


});