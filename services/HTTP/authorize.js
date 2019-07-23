const { BadRequest, Forbidden } = require('http-errors');
const t = require('@venture-api/fixtures/dictionary/topics');


/**
 * Authorize a request for a specific access record.
 * 1. Extract JWT
 * 2. Map shorthand properties to real ones
 * 3. Perform a call to `checkACE`
 * 4. Throw if no permission
 * 5. Return principal value
 *
 * @param {Object<IncomingMessage>} req - the request
 * @param {Array} access - access 'tuple': [principal, action, resource]
 * @return {String} - principal ID value (later objects probably)
 */
module.exports = async function (req, access) {

    const [ gate, logger ] = this;
    const { tasu } = gate.state;

    if (! req.headers.authorization)
        throw new BadRequest('No authorization header');

    const token = req.headers.authorization.split('Bearer ')[1];
    logger.debug('checking token presence');

    if (! token)
        throw new BadRequest('No authorization token');

    logger.debug('verifying token', token);
    const tokenPayload = await tasu.request(t.verifyToken, token) ;

    if (! tokenPayload)
        throw new BadRequest('Token verification failed');

    // extract principal ID
    const { id, type } = tokenPayload;

    if (! id)
        throw new BadRequest('No principal ID in token payload');

    // authorize
    const [ principalField, action, resource ] = access;

    if (`${type}Id` !== principalField) {
        // token principal type doesn't match endpoint principal type
        // example: we are authorizing player but pass a token for a facility
        throw new BadRequest('Principal type mismatch');
    }

    logger.debug('authorizing', type, id, action, resource);
    const can = await tasu.request(t.checkACE, [ id, action, resource ]);

    if (! can)
        throw new Forbidden('Access denied');

    // fetch & attach authorized principal
    req[type] = await tasu.request('identify', { id });
};
