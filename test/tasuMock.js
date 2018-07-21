const assert = require('assert');
const {bonner} = require('@venture-api/fixtures/fixtures/player');
const {rdrn, boex} = require('@venture-api/fixtures/fixtures/facility');
const {ironOne} = require('@venture-api/fixtures/fixtures/resource');
const regions = require('@venture-api/fixtures/fixtures/region');


module.exports = (tasu) => {

    tasu.listen('mold.status', () => {
        return {status: 'ok', id: 'MOLD-001'}
    });

    tasu.listen('identifyPlayer', ({email}) => {
        assert(email);
        return null;
    });

    tasu.listen('getPlayer', ({id}) => {
        assert(id);
        bonner.id = id;
        return bonner;
    });

    tasu.listen('getFacility', ({id}) => {
        assert(id);
        switch (id) {
            case rdrn.id:
                return rdrn;
            case boex.id:
                return boex;
        }
    });

    tasu.listen('getRegion', ({name}) => {
        assert(name);
        return regions[name];
    });

    tasu.listen('identifyFacility', ({code}) => {
        assert(code);
        if (code === rdrn.code) return null;
    });

    tasu.listen('checkACE', (accessRecord) => {
        assert(accessRecord);
        return true;
    });

    tasu.listen('generateId.player', ({}) => {
        return bonner.id;
    });

    tasu.listen('generateId.facility', ({}) => {
        return rdrn.id;
    });

    tasu.listen('generateId.resource', ({}) => {
        return ironOne.id;
    });



};
