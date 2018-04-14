const assert = require('assert');
const {checkSchema, validationResult} = require('express-validator/check');
const schemata = require('./schemata');
const ReqError = require('../../util/ReqError');


module.exports = (...params) => {

    const schema = {};
    params.map((param) => {
        const [module, fieldName] = param.split(':');
        schema[fieldName] = schemata[param];
        assert(schema[fieldName], `no validation schema for '${param}'`);
    });

    return [checkSchema(schema), (req, res, next) => {

        const result = validationResult(req);
        if (!result.isEmpty()) {
            const logger = req.app.get('logger');
            logger.debug('got validation error', result.mapped());
            throw new ReqError(422, 'validation error', result.mapped());
        }
        next();
    }]
};
