const {assert} = require('chai');
const resourceId = require('../util/resourceId');
const app = require('../app');


describe('utils', () => {

    describe('resourceId', () => {

        it('returns resource id', (done) => {
            const id = resourceId({type: 'coal', code: 'MNTRED'});
            assert.include(id, 'CL');
            assert.include(id, 'MNTRED');
            done();
        });

    });

});


describe('routes', () => {

    before(function (done)  {
        app.on('ready', (srv, cnfg) => {
            nats = app.get('nats');
            redis = app.get('redis');
            NATSmock(nats); // add mock subscribers
            server = srv;
            config = cnfg;
            server.listen(TEST_PORT);

            parallel([

                function cleanRedis(done) {
                    redis.multi().del(`account:sign-in-failure:${EMAIL2}`).exec(done);
                }

            ], (error) => {

                done(error);
            });
        });
    });


});