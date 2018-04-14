const ReqError = require('../../util/ReqError');


module.exports = async ({tokenPayload, method, app}) => {

    const {i: id} = tokenPayload;
    if (!id)
        throw new ReqError(400, 'player id missing in token payload');
    const logger = app.get('logger');
    logger.debug('authorizing player');
    const tasu = app.get('tasu');
    return await tasu.request('player.get', {id});
};
