const shortId = require('shortid');


module.exports = () => {

    const id = shortId.generate();
    return `PL-${id}`;
};