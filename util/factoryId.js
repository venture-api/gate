const shortId = require('shortid');
const RES_TYPE_MAP = require('./resourceTypeMap');


module.exports = ({type, code}) => {

    const id = shortId.generate();
    return `${RES_TYPE_MAP[type]}-${code}-${id}`;
};