const assert = require('assert');
const {players: {bonner}, factories: {rdrn}, regions, resources} = require('@venture-api/fixtures');


module.exports = (tasu) => {

    tasu.listen('mold.status', () => {
        return {status: 'ok', id: 'MOLD-001'}
    });

    tasu.listen('player.identify', ({email}) => {
        assert(email);
        return null;
    });

    tasu.listen('player.get', ({id}) => {
        assert(id);
        bonner.id = id;
        return bonner;
    });

    tasu.listen('factory.get', ({id}) => {
        assert(id);
        if (id === rdrn.id) return rdrn;
    });

    tasu.listen('region.get', ({name}) => {
        assert(name);
        return regions[name];
    });

    tasu.listen('factory.identify', ({code}) => {
        assert(code);
        if (code === rdrn.code) return null;
    });

    tasu.listen('acl.can', (accessRecord) => {
        assert(accessRecord);
        return true;
    });

    tasu.listen('player.id', ({}) => {
        return 'PL-YSL6H3DNRON2';
    });

    tasu.listen('factory.id', ({}) => {
        return 'FC-WTQA6GN3DK27IT-GN';
    });

    tasu.listen('resource.id', ({}) => {
        return resources.ironOne.id;
    });



};
