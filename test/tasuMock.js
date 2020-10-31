import assert from 'assert';
import pl from '@venture-api/fixtures/fixtures/players.js';
import fc from '@venture-api/fixtures/fixtures/facilities.js';
import rs from '@venture-api/fixtures/fixtures/resources.js';
import rg from '@venture-api/fixtures/fixtures/regions.js';
import w  from '@venture-api/fixtures/dictionary/words.js';
import t from '@venture-api/fixtures/dictionary/topics.js';


export default function (tasu) {

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
                return { id: pl.bonner.id, type: w.player };
            case 'RDRNTOKEN':
                return { id: fc.rdrn.id, type: w.facility }
        }
    });

    tasu.listen(t.identify, ({ email, id, code }) => {

        if (email) {
            return null;
        }

        switch (id) {
            case pl.bonner.id:
                return pl.bonner;
            case fc.rdrn.id:
                return fc.rdrn;
            case fc.boex.id:
                return fc.boex;
        }

        if (code === fc.rdrn.code)
            return null;

        return null;

    });

    tasu.listen(t.getRegion, ({name}) => {
        assert(name);
        return rg[name];
    });

    tasu.listen(t.checkACE, (accessRecord) => {
        assert(accessRecord);
        return true;
    });

    tasu.listen(t.generateFacilityId, ({ type }) => {
        if (type === w.mine)
            return fc.rdrn.id
    });

    tasu.listen(t.generateTransportOrderId, () => {
            return 'TO-GTXGA787IFAAFKBDBJ';
    });

    tasu.listen(t.requestResourceData, ({ facilityId }) => {
        if (facilityId === fc.rdrn.id)
            return rs.ironOne
    });

    tasu.listen(t.generateId, ({ type }) => {

        switch (type) {
            case w.player:
                return pl.bonner.id;
            case w.facility:
                return fc.rdrn.id;
            case w.resource:
                return rs.ironOne.id;
        }
    });
};
