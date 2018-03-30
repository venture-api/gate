const jwt = require('jsonwebtoken');
const {promisify} = require('util');


module.exports = () => {

    return async (req, res, next) => {

        const logger = req.app.get('logger');
        logger.debug('verifying factory');
        const token = req.token;
        if (!token) res.status(401);
        const {jwt: {secret}} = req.app.get('config');
        const query = req.app.get('query');
        const verify = promisify(jwt.verify);
        const {c: code} = await verify(token, secret);
        req.factory = await query.request('factory.get', {code});

        return next()
    }
};
