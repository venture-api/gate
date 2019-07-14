const ReqError = require('../../util/ReqError');


module.exports = function (body, contentType) {

    if (!body)
        return;

    if (contentType === 'application/json') {
        return JSON.parse(body);
    } else {
        throw new ReqError(400, 'Unexpected content type');
    }
};
