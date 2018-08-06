const http = require('http');
const URL = require('url');


/**
 * General request handler
 *
 * @async
 * @param {Object} req - IncomingMessage (https://nodejs.org/api/http.html#http_class_http_incomingmessage)
 * @param {Object} res - ServerResponse (https://nodejs.org/api/http.html#http_class_http_serverresponse)
 * @return {Promise}
 */
module.exports = async function (req, res) {

    const {kojo, logger} = this;
    const {method, url} = req;
    logger.debug('processing', method, url);
    const start = process.hrtime();
    const {pathname} = URL.parse(url, true);
    const trimmedPath = pathname.replace(/\/+$/g, '');
    const routes = kojo.get('routes');
    res.sendDate = true;

    // 404 pathname not found
    if (!routes[trimmedPath]) {
        res.writeHead(404);
        res.end(http.STATUS_CODES[404]);
        return
    }

    // 405 method not found (thus not allowed)
    if (routes[trimmedPath] && !routes[trimmedPath][method]) {
        res.writeHead(405);
        res.end(http.STATUS_CODES[405]);
        return
    }

    try {
        const routeHandler = routes[trimmedPath][method];
        res.setHeader('Content-Type', 'application/json');
        const JSONstring = JSON.stringify(await routeHandler(req, res));
        const length = Buffer.byteLength(JSONstring);
        res.setHeader('Content-Length', length);
        logger.info('response OK', res.statusCode, length, Number.parseFloat(process.hrtime(start)[0] + process.hrtime(start)[1]*1e-9).toFixed(5));
        res.end(JSONstring);
    } catch (error) {
        logger.error(error);
        res.writeHead(500);
        res.end(http.STATUS_CODES[500]);
    }
};
