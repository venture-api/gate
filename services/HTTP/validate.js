const { BadRequest } = require('http-errors');


/**
 * Complies the schema and returns the validation
 * function which throws HttpError.BadRequest on failed validation.
 *
 * @param {Object} req - IncomingMessage
 * @param {function} validator - AJV's compiled schema validator
 * @return {undefined}
 * @throws {BadRequest}
 */
module.exports = function(req, validator) {

    const [ gate, logger ] = this;

    // validate incoming data combined
    const payload = {};

    if (Object.entries(req.query).length) payload.query = req.query;
    if (Object.entries(req.body).length) payload.body = req.body;

    logger.debug('checking:', JSON.stringify(payload));
    const valid = validator(payload);

    if (! valid) {
        const { errors: [ error ]} = validator;

        logger.debug('failed:', JSON.stringify(error.message));
        const { keyword, params } = error;
        let message;

        if (keyword === 'required') {
            message = `Missing '${error.params.missingProperty}'`;
        } else if (keyword === 'minProperties') {
            message = `No data received`
        } else if (keyword === 'type') {
            message = `'${error.dataPath.split('.').pop()}' ${error.message}`
        } else if (keyword === 'minLength') {
            message = `'${error.dataPath.split('.').pop()}' is too short`
        } else if (keyword === 'additionalProperties') {
            message = `'${params.additionalProperty}' should not be in payload`
        } else if (keyword === 'format')  {
            message = `Wrong format for '${error.dataPath.split('.').pop()}'`
        } else if (keyword === 'pattern')  {
            message = `Requirements not met for '${error.dataPath.split('.').pop()}'`
        } else {
            logger.debug("couldn't format AJV error", keyword, error.dataPath);
            const prefix = error.dataPath ? `'${error.dataPath.replace('.', '')}'` : 'Request payload';
            const suffix = error.params.additionalProperty ? `: '${error.params.additionalProperty}'` : '';
            message =  `${prefix} ${error.message}${suffix}`;
        }

        throw new BadRequest(message);
    }

};
