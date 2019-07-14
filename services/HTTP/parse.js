const querystring = require('querystring');
const ReqError = require('../../util/ReqError');


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
            throw new ReqError(400, 'Unexpected content type');
    }

    logger.debug('parsed', JSON.stringify(result));
    return result;
};
