const http = require('http');


/**
 * Start listening to requests
 *
 * @return {Promise.<Object>} - node's httpServer
 */
module.exports = async function () {

    const {kojo, logger} = this;
    const {http: {port}} = kojo.get('config');
    const trid = kojo.get('trid');
    const {http: http_} = kojo.modules;
    const server = http.createServer(http_.rootHandler);
    return new Promise(resolve => {
        server.listen(port, () => {
            logger.info(trid.base(), 'listening on port', port);
            resolve(server);
        });
    });
};
