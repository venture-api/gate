const AJV = require('ajv');


/**
 * Register endpoint handler. It also compiles AJV's validation function as
 * 'validator'.
 *
 * @param {object} config - endpoint config object
 * @param {string} config.method - HTTP method
 * @param {string} config.pathname - HTTP pathname
 * @param {object} config.schema - AJV validation schema
 * @param {string} config.access - ACL access record ([principal, action, resource])
 * @param {function} handler - the handler function
 * @return {undefined}
 */
module.exports = function (config, handler) {

    const [ gate, logger ] = this;
    logger.debug('registering route', config);
    const { method, pathname, access, schema } = config;
    let validator;

    if (schema) {
        const { query, body } = schema;
        const combinedSchema = {
            title: 'Incoming data combined',
            type: 'object',
            properties: {
                ...query && { query },
                ...body && { body }
            },
            additionalProperties: false,
            minProperties: [ query, body ].filter(p => p && (p.required || p.minItems)).length
        };
        validator = (new AJV()).compile(combinedSchema);
    }

    const { routes } = gate.state;

    if (!routes[pathname])
        routes[pathname] = {};

    routes[pathname][method] = { handler, access, ...validator && { validator } };
};
