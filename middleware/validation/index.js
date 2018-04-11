const assert = require('assert');
const ReqError = require('../../util/ReqError');
const commonFields = require('./commonFields');


module.exports = (...params) => {

    const schema = {};
    params.map((param) => {
        schema[param] = commonFields[param];
        assert(schema[param], `no validation schema for '${param}'`);
    });

    return async (req, res, next) => {

        const logger = req.app.get('logger');
        logger.debug('validating', ...params);
        req.check(schema);
        const validationErrors = req.validationErrors();
        if (validationErrors) {
            logger.debug('got validation error', validationErrors);
            throw new ReqError(422, 'validation error', validationErrors);
        }
        next()
    }
};
