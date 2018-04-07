const jwt = require('jsonwebtoken');
const {promisify} = require('util');

const sign = promisify(jwt.sign);

module.exports = async (payload, secret) => {

    return await sign(payload, secret);
};