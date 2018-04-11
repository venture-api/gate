const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const ReqError = require('../../util/ReqError');


module.exports = (moduleName) => {

    const authorize = require(`./${moduleName}.js`);
    const verify = promisify(jwt.verify);

    return async (req, res, next) => {


        // verify token

        const {token} = req;
        if (!token)
            throw new ReqError(400, 'no authorization token');
        const {jwt: {secret}} = req.app.get('config');
        req.tokenPayload = await verify(token, secret);
        const {t: type} = req.tokenPayload;
        if (type !== moduleName)
            throw new ReqError(400, `wrong token type '${type}' for module '${moduleName}'`);

        // call auth module

        req[moduleName] = await authorize(req);
        next()
    }
};
