const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const {BadRequest, Unauthorized} = require('http-errors');
const capitalize = require('../../util/capitalize');


const verify = promisify(jwt.verify);

module.exports = async function (permission) {

    const {kojo, logger} = this;
    const {tasu, config} = kojo.get();

    const {params} = req;

    if (!req.headers.authorization)
        throw new BadRequest('no authorization header');

    const token = req.headers.authorization.split('Bearer ')[1];
    logger.debug('checking token presence');

    if (!token)
        throw new BadRequest('no authorization token');

    const {jwt: {secret}} = config;
    logger.debug('verifying token', token);
    let tokenPayload;

    try {
        tokenPayload = await verify(token, secret);
    } catch (error) {
        throw new BadRequest('token verification failed');
    }
    const {t: type, i: id} = tokenPayload;

    if (!id)
        throw new BadRequest('no id in token payload');

    // authenticate
    logger.debug('identifying principal', type, id);
    const principal = await tasu.request(`get${capitalize(type)}`, {id});

    if (!principal)
        throw new BadRequest('unknown principal');

    req[type] = principal;

    // authorize
    const elementId = params.id;
    logger.debug('authorizing:', principal.id, permission, elementId);
    const can = await tasu.request('checkACE', [principal.id, permission, elementId]);

    if (!can)
        throw new Unauthorized('authorization failed');
};
