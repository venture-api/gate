const assert = require('assert');
const { bonner } = require('@venture-api/fixtures/fixtures/player');
const { rdrn, boex } = require('@venture-api/fixtures/fixtures/facility');
const { ironOne } = require('@venture-api/fixtures/fixtures/resource');
const regions = require('@venture-api/fixtures/fixtures/region');
const t = require('@venture-api/fixtures/dictionary/topics');
const w = require('@venture-api/fixtures/dictionary/words');


module.exports = (tasu) => {

    tasu.listen('mold.status', () => {
        return { status: 'ok', id: 'MOLD-001' }
    });

    tasu.listen(t.signToken, () => {
        return 'FAKEJWT';
    });

    tasu.listen(t.verifyToken, (token) => {
        console.log('> mock verifying token', token);

        switch (token) {
            case 'BADTOKEN':
                return null;
            case 'NOPRINCIPALTOKEN':
                return {};
            case 'BONNERTOKEN':
                return { id: bonner.id, type: w.player };
            case 'RDRNTOKEN':
                return { id: rdrn.id, type: w.facility }
        }
    });

    tasu.listen(t.identify, ({ email, id, code }) => {

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

    tasu.listen(t.getRegion, ({name}) => {
        assert(name);
        return regions[name];
    });

    tasu.listen(t.checkACE, (accessRecord) => {
        assert(accessRecord);
        return true;
    });

    tasu.listen(t.generateFacilityId, ({ type }) => {
        if (type === w.mine)
            return rdrn.id
    });

    tasu.listen(t.generateId, ({ type }) => {

        switch (type) {
            case w.player:
                return bonner.id;
            case w.facility:
                return rdrn.id;
            case w.resource:
                return ironOne.id;
        }

    });
};
