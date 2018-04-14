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

    tasu.listen('factory.get', ({code}) => {
        assert(code);
        if (code === factoryOne.code) return null;
    });

    tasu.listen('acl.get', (accessRecord) => {
        assert(accessRecord);
        return true;
    });

};
