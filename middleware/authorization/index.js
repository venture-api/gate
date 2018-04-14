const assert = require('assert');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const ReqError = require('../../util/ReqError');


const ACTION_MAP = {
    get: 'read',
    post: 'create',
    patch: 'update',
    delete: 'delete'
};



module.exports = (moduleName) => {

    const authenticate = require(`./${moduleName}.js`);
    const verify = promisify(jwt.verify);

    return async (req, res, next) => {

        const {token, app, baseUrl, method} = req;
        const logger = app.get('logger');
        const tasu = app.get('tasu');


        // verify token

        if (!token)
            throw new ReqError(400, 'no authorization token');
        const {jwt: {secret}} = app.get('config');
        logger.debug('verifying token', token);
        const tokenPayload = await verify(token, secret);
        logger.debug('payload verified:', tokenPayload);
        const {t: type, i: id} = tokenPayload;
        if (!type || type !== moduleName)
            throw new ReqError(400, `wrong token type '${type}' for module '${moduleName}'`);
        if (!id)
            throw new ReqError(400, 'id missing in token payload');


        // authenticate

        const principal = await tasu.request(`${type}.get`, {id});
        if (!principal)
            throw new ReqError(400, 'unknown principal');
        req[moduleName] = principal;


        // authorize

        logger.debug('authorizing principal action');
        const accessRecord = {
            id: principal.id,
            do: ACTION_MAP[method.toLowerCase()],
            to: baseUrl
        };
        const can = await tasu.request('acl.get', accessRecord);
        if (!can)
            throw new ReqError(403, 'authorization failed', accessRecord);
        next();
    }
};
