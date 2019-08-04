const querystring = require('querystring');
const { BadRequest } = require('http-errors');


module.exports = function (body, contentType) {

    const [ gate, logger ] = this;

    if (! body) return;

    let result;
    switch (contentType) {

        case 'application/json':
            result = JSON.parse(body);
            break;

        case 'application/x-www-form-urlencoded':
            result = querystring.parse(body);
            break;

        default:
            throw new BadRequest('Unexpected content type');
    }

    logger.debug('parsed', JSON.stringify(result));
    return result;
};
