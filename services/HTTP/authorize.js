const jwt = require('jsonwebtoken');
const { BadRequest, Forbidden } = require('http-errors');
const { promisify } = require('util');
const payloadMap = require('@venture-api/fixtures/maps/jwt');
const idMeta = require('@venture-api/fixtures/util/idMeta');
const verify = promisify(jwt.verify);

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
    const { tasu, config } = gate.state;

    if (! req.headers.authorization)
        throw new BadRequest('No authorization header');

    const token = req.headers.authorization.split('Bearer ')[1];
    logger.debug('checking token presence');

    if (! token)
        throw new BadRequest('No authorization token');

    const { jwt: { secret }} = config;
    logger.debug('verifying token', token);
    let tokenPayload;

    try {
        tokenPayload = await verify(token, secret);
    } catch (error) {
        throw new BadRequest('Token verification failed');
    }
    // extract principal ID
    const { [payloadMap.principalId]: principalId } = tokenPayload;

    if (! principalId)
        throw new BadRequest('No principal ID in token payload');

    // authorize
    const { type: principalType } = idMeta(principalId);
    const [ principalField, action, resource ] = access;

    if (`${principalType}Id` !== principalField) {
        // token principal type doesn't match endpoint principal type
        // example: we are authorizing player but pass a token for a facility
        throw new BadRequest('Principal type mismatch');
    }

    logger.debug('authorizing', principalType, principalId, action, resource);
    const can = await tasu.request('checkACE', [ principalId, action, resource ]);

    if (! can)
        throw new Forbidden('Access denied');

    // fetch & attach authorized principal
    req[principalType] = await tasu.request('identify', { id: principalId });
};
