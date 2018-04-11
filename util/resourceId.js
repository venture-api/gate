const shortId = require('shortid');
const RES_TYPE_MAP = require('./resourceAbbrMap');


module.exports = ({type, code}) => {

    const id = shortId.generate();
    return `RES-${RES_TYPE_MAP[type]}-${code}-${id}`;
};