const { StringDecoder } = require('string_decoder');
const { HttpError } = require('http-errors');
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

    const [ gate, logger ] = this;
    const { trid } = gate.state;
    const { HTTP } = gate.services;

    const { method, url } = req;

    const reqID = trid.seq();
    logger.debug(`<- [${reqID}] ${method} ${url}`);
    req.headers['content-type'] && logger.debug('content-type is', req.headers['content-type']);
    const start = process.hrtime();

    // set general headers
    res.sendDate = true;
    res.setHeader('X-Request-ID', reqID);
    res.setHeader('Content-Type', 'application/json');

    // capture body
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    const bodyReady = new Promise(resolve => {
        req.on('end', () => {
            buffer += decoder.end();
            resolve(buffer);
        });
    });
    const body = await bodyReady; // TODO add content length limit!

    // general request handling
    try {
        // extract endpoint config and parameters
        const {resourceId, handler, access, query} = HTTP.router(method, url);
        req.resourceId = resourceId;
        req.query = query;

        // parse JSON body
        req.body = HTTP.parse(body, req.headers['content-type']);

        // run authorization if any
        if (access) {
            const [principalField] = access;
            req[principalField] = await HTTP.authorize(req, access); // like `req.playerId = PLR-687687687`
        }

        // call endpoint handler
        const result = await handler(req, res);

        // res.end() could be called earlier so there will be no result
        if (result) {
            const JSONstring = JSON.stringify(result);

            // OK response
            const length = Buffer.byteLength(JSONstring);
            res.setHeader('Content-Length', length);
            logger.debug(`-> [${reqID}] ${res.statusCode} / ${length} bytes / ${HRT2sec(process.hrtime(start))} sec`);
            res.end(JSONstring);
        }

    } catch (error) {

        // error response
        logger.error(`!! [${reqID}] ${error.statusCode ? error.statusCode : ''}`, error.message);

        if (error instanceof HttpError) {
            res.writeHead(error.statusCode);
            res.end(JSON.stringify({ message: error.message }));
        } else {
            logger.error(error.stack);
            res.writeHead(500);
            res.end('Unexpected error');
        }
    }
};
