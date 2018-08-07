const http = require('http');
const URL = require('url');
const HRT2sec = require('../../util/HRT2sec');


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
    const trid = kojo.get('trid');
    const reqID = trid.seq();
    logger.debug(`<- [${reqID}] ${method} ${url}`);
    const start = process.hrtime();

    // the router :)
    const {pathname} = URL.parse(url, true);
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');
    const [major, resID, minor] = trimmedPath.split('/');
    const routePattern = '/' + [major, resID ? ':id' : undefined, minor].filter(p => p).join('/');

    const routes = kojo.get('routes');
    res.sendDate = true;
    res.setHeader('X-Request-ID', reqID);

    // 404 pathname not found
    if (!routes[routePattern]) {
        const statusCode = 404;
        res.writeHead(statusCode);
        res.end(http.STATUS_CODES[statusCode]);
        logger.error(`!! [${reqID}] ${res.statusCode} ${http.STATUS_CODES[statusCode]}`);
        return
    }

    // 405 method not found (thus not allowed)
    if (routes[routePattern] && !routes[routePattern][method]) {
        const statusCode = 405;  // TODO abstract into some error response?
        res.writeHead(statusCode);
        res.end(http.STATUS_CODES[statusCode]);
        logger.error(`!! [${reqID}] ${res.statusCode} ${http.STATUS_CODES[statusCode]}`);
        return
    }

    try {
        const routeHandler = routes[routePattern][method];
        if (resID)
            req.params = {id: resID};
        res.setHeader('Content-Type', 'application/json');
        const JSONstring = JSON.stringify(await routeHandler(req, res));
        const length = Buffer.byteLength(JSONstring);
        res.setHeader('Content-Length', length);
        logger.debug(`-> [${reqID}] ${res.statusCode} / ${length} bytes / ${HRT2sec(process.hrtime(start))} sec`);
        res.end(JSONstring);
    } catch (error) {
        logger.error(`!! [${reqID}]`, error);
        res.writeHead(500);
        res.end(http.STATUS_CODES[500]);
    }
};
