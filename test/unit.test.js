const {assert} = require('chai');
const resourceId = require('../util/resourceId');
const playerId = require('../util/playerId');
const factoryId = require('../util/factoryId');


describe('utils', () => {

    describe('resourceId', () => {

        it('returns resource id', (done) => {
            const id = resourceId({type: 'coal', code: 'MNTRED'});
            assert.include(id, 'RES');
            assert.include(id, 'CL');
            assert.include(id, 'MNTRED');
            done();
        });

    });

    describe('playerId', () => {

        it('returns player id', (done) => {
            const id = playerId();
            assert.include(id, 'PL');
            done();
        });

    });

    describe('factoryId', () => {

        it('returns factory id', (done) => {
            const id = factoryId({code: 'MNTBLU', type: 'ore'});
            assert.include(id, 'FC');
            assert.include(id, 'MNTBLU');
            assert.include(id, 'OR');
            done();
        });

    });

});
