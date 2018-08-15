const {StringDecoder} = require('string_decoder');
const HRT2sec = require('../../util/HRT2sec');
const ReqError = require('../../util/ReqError');


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
    const {middleware, http} = kojo.modules;
    const reqID = trid.seq();
    logger.debug(`<- [${reqID}] ${method} ${url}`);
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
        // extract endpoint config
        const {handler, access} = http.routing(method, url);
        if (resID)
            req.params = {id: resID};
        const contentType = req.headers['content-type'];

        // parse JSON body
        if (contentType === 'application/json') {
            req.json = JSON.parse(body);
        }

        // run authorization if any
        if (access) {
            req[principalType] = await middleware.authorize(principalType);
        }

        // call handler
        const JSONstring = JSON.stringify(await handler(req, res));

        // OK response
        const length = Buffer.byteLength(JSONstring);
        res.setHeader('Content-Length', length);
        logger.debug(`-> [${reqID}] ${res.statusCode} / ${length} bytes / ${HRT2sec(process.hrtime(start))} sec`);
        res.end(JSONstring);

    } catch (error) {

        // error response
        logger.error(`!! [${reqID}]`, error);
        if (error instanceof ReqError) {
            res.writeHead(error.statusCode);
            res.end(JSON.stringify({message: error.message}));
        } else {
            res.writeHead(500);
            res.end('Unexpected error');
        }
    }
};
