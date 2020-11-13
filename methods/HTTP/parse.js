import querystring from 'querystring';
import errors from 'http-errors';


const { BadRequest } = errors;

export default function (body, contentType) {

    const [ , logger ] = this;

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
