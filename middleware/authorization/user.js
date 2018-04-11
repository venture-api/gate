const ReqError = require('../../util/ReqError');


module.exports = async (req) => {

    const {id} = req.tokenPayload;
    if (!id)
        throw new ReqError(400, 'player id missing in token payload');
    const logger = req.app.get('logger');
    logger.debug('authorizing player');
    const tasu = req.app.get('tasu');
    req.player = await tasu.request('player.get', {id});
    logger.debug('player authenticated:', req.player.id);
};