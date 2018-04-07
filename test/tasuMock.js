const assert = require('assert');


module.exports = (tasu) => {

    tasu.listen('mold.status', () => {
        return {status: 'ok', id: 'MOLD-001'}
    });

    tasu.listen('player.identify', ({email}) => {
        assert(email);
        return null;
    });

};
