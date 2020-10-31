const httpErrors = require('http-errors');


module.exports = async (gate, logger) => {

    const {fastify, config} = gate.get();

    fastify.get('/mock/oauth/auth', async (req, res) => {

        const {redirect_uri, scope, client_id} = req.query;
        const {scheme, host, port} = config.http;
        logger.debug('authenticating', client_id);
        const registeredURIs = [`${scheme}://${host}:${port}/oauth/mock/callback`];
        if (!registeredURIs.includes(redirect_uri))
            throw new httpErrors.BadRequest('bad redirect_uri');
        if (client_id !== 'MOCK_CLIENT_ID')
            throw new httpErrors.BadRequest('bad client id');
        logger.debug('redirecting to', redirect_uri);
        res.redirect(`${redirect_uri}?code=AUTHORZTN_CODE&scope=${scope}`);
    });

};