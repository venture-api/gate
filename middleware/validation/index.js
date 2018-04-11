const ReqError = require('../../util/ReqError');
const commonFields = require('./commonFields');


module.exports = (...params) => {

    return async (req, res, next) => {

        const logger = req.app.get('logger');
        logger.debug('validating', ...params);
        const schema = {};
        params.map((param) => {
            schema[param] = commonFields[param];
        });
        req.check(schema);
        const validationErrors = req.validationErrors();
        if (validationErrors) {
            logger.debug('got validation error', validationErrors);
            throw new ReqError(422, 'validation error', validationErrors);
        }
        next()
    }
};
