const assert = require('assert');
const schemata = require('./schemata');
const ReqError = require('../../util/ReqError');

/**
 * Create params map (named params) from original route path and params.
 * This is to add missing params feature in koa-route.
 *
 * @param {String} routePath - original route path
 * @param {Array} params - param array
 * @returns {Object} - param map
 * */
function paramsMap(routePath, params) {
    const names = routePath.split('/').reduce((array, piece) => {
        if (piece.includes(':')) {
            ;
            array.push(piece.replace(':', ''));
        }
        return array;
    }, []);
    return names.reduce((dict, name, index) => {
        dict[name] = params[index];
        return dict;
    }, {});
}

/**
 * Validates fields, found anywhere in request
 *
 * @param {...String} fields - field names to validate
 * @returns {Function} - validation middleware
 * */
module.exports = (...fields) => {

    const schema = {};
    fields.map((field) => {
        const [module, fieldName] = field.split(':');
        schema[fieldName] = schemata[field];
        assert(schema[fieldName], `no validation schema for '${field}'`);
    });

    return async(ctx, ...params) => {
        const next = params.pop();
        // add params missing in koa-route
        ctx.params = paramsMap(ctx.routePath, params);
        ctx.logger.debug('validating', ...fields);
        ctx.check(schema);
        const result = await ctx.getValidationResult();
        if (!result.isEmpty()) {
            const mapped = result.mapped();
            ctx.logger.error('validation failed', mapped);
            ctx.throw(422, 'validation error', {fields: mapped});
        }
        ctx.logger.debug('no validation errors');
    }
};
