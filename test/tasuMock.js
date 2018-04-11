const assert = require('assert');
const {playerOne} = require('./fixtures');


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

};
