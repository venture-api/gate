const ReqError = require('../../util/ReqError');


module.exports = async ({tokenPayload, app}) => {

    const {i: id} = tokenPayload;
    if (!id)
        throw new ReqError(400, 'factory id is missing in token payload');
    const logger = app.get('logger');
    logger.debug('authorizing factory');
    const tasu = app.get('tasu');
    return await tasu.request('factory.get', {id});
};