const {assert} = require('chai');
const resourceId = require('../util/resourceId');


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
