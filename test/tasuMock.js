const assert = require('assert');
const {bonner} = require('@venture-api/fixtures/fixtures/player');
const {rdrn, boex} = require('@venture-api/fixtures/fixtures/facility');
const {ironOne} = require('@venture-api/fixtures/fixtures/resource');
const regions = require('@venture-api/fixtures/fixtures/region');


module.exports = (tasu) => {

    tasu.listen('mold.status', () => {
        return {status: 'ok', id: 'MOLD-001'}
    });

    tasu.listen('token.sign', () => {
        return 'FAKEJWT';
    });

    tasu.listen('identify', ({ email, id, code }) => {

        if (email) {
            return null;
        }

        switch (id) {
            case bonner.id:
                return bonner;
            case rdrn.id:
                return rdrn;
            case boex.id:
                return boex;
        }

        if (code === rdrn.code)
            return null;

        return null;

    });

    tasu.listen('getRegion', ({name}) => {
        assert(name);
        return regions[name];
    });

    tasu.listen('checkACE', (accessRecord) => {
        assert(accessRecord);
        return true;
    });

    tasu.listen('generateId.player', ({}) => {
        return bonner.id;
    });

    tasu.listen('facility.id.generate', ({}) => {
        return rdrn.id;
    });

    tasu.listen('generateId.resource', ({}) => {
        return ironOne.id;
    });



};
