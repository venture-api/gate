const ReqError = require('../util/ReqError');


module.exports = async (gate, logger) => {

    const { config } = gate.state;
    const { HTTP } = gate.services;
    const { scheme, host, port } = config.http;

    HTTP.addRoute({
        method: 'GET',
        pathname: '/mock-oauth'
    }, async (req, res) => {

        const { redirect_uri, scope, client_id } = req.query;

        logger.debug('authenticating', client_id);
        const registeredURIs = [`${scheme}://${host}:${port}/oauth/mock/callback`];

        if (! registeredURIs.includes(redirect_uri))
            throw new ReqError(400, 'Bad redirect_uri');

        if (client_id !== 'MOCK_CLIENT_ID')
            throw new ReqError(400, 'Bad client id');

        logger.debug('redirecting to', redirect_uri);
        res.writeHead(302, {'Location': `${redirect_uri}?code=AUTHORZTN_CODE&scope=${scope}`});
        res.end();
    });

};