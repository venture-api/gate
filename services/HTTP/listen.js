const http = require('http');


/**
 * Start listening to requests
 *
 * @return {Promise.<Object>} - node's httpServer
 */
module.exports = async function () {

    const [ gate, logger ] = this;
    const { trid, config: { http: { port }}} = gate.state;
    const { HTTP } = gate.services;

    const serverId = trid.base();
    const server = http.createServer(HTTP.requestHandler);
    server.on('close', () => {
        logger.info(`[${serverId}] closed`);
    });
    return new Promise(resolve => {
        server.listen(port, () => {
            logger.info(`[${serverId}] listening on port ${port}`);
            resolve(server);
        });
    });
};
