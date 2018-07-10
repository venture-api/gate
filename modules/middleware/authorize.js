const jwt = require('jsonwebtoken');
const {BadRequest, Unauthorized} = require('http-errors');
const {promisify} = require('util');
const capitalize = require('../../util/capitalize');


const ACTION_MAP = {
    get: 'read',
    post: 'create',
    patch: 'update',
    delete: 'delete'
};
const verify = promisify(jwt.verify);

module.exports = function (details=null) {

    const {kojo, logger} = this;
    const {tasu, config} = kojo.get();

    return async (req) => {

        const {raw: {method, url}} = req;

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
        logger.debug('authenticating', type, id);
        const principal = await tasu.request(`get${capitalize(type)}`, {id});

        if (!principal)
            throw new BadRequest('unknown principal');

        req[type] = principal;

        // authorize
        const action = ACTION_MAP[method.toLowerCase()];
        logger.debug('authorizing:', type, principal.id, action, url, details);
        const accessRecord = [principal.id, action, url, details];
        const can = await tasu.request('acl.can', accessRecord);

        if (!can)
            throw new Unauthorized('authorization failed', accessRecord);
    }
};
