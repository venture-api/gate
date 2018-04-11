const assert = require('assert');
const shortId = require('shortid');
const RES_TYPE_MAP = require('./resourceAbbrMap');


module.exports = ({type, code}) => {

    const id = shortId.generate();
    const abbr = RES_TYPE_MAP[type];
    assert(abbr, `no abbreviation found for '${type}'`);
    return `FC-${code}-${abbr}-${id}`;
};