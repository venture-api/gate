const assert = require('assert');
const {playerOne, factoryOne} = require('./fixtures');


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
        playerOne.id = id;
        return playerOne;
    });

    tasu.listen('factory.get', ({id}) => {
        assert(id);
        if (id === factoryOne.id) return factoryOne;
    });

    tasu.listen('factory.identify', ({code}) => {
        assert(code);
        if (code === factoryOne.code) return null;
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
        return 'RS-O䠘힏B呹䅞B쎴䲪8T8賯䋸KS5O-CL';
    });



};
