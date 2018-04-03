const ReqError = require('../../util/ReqError');


module.exports = async (req) => {

    const {c: code} = req.tokenPayload;
    if (!code)
        throw new ReqError(400, 'factory code is missing in token payload');
    const logger = req.app.get('logger');
    logger.debug('authorizing factory');
    const tasu = req.app.get('tasu');
    req.factory = await tasu.request('factory.get', {code});
};