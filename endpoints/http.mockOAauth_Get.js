import httpErrors from 'http-errors';
const { BadRequest } = httpErrors;


export default async (gate, logger) => {

    const { config } = gate.state;
    const { HTTP } = gate.methods;
    const { scheme, host, port } = config.http;

    HTTP.addRoute({
        method: 'GET',
        pathname: '/mock-oauth'
    }, async (req, res) => {

        const { redirect_uri, scope, client_id } = req.query;

        logger.debug('authenticating', client_id);
        const registeredURIs = [`${scheme}://${host}:${port}/oauth/mock/callback`];

        if (! registeredURIs.includes(redirect_uri))
            throw new BadRequest('Bad redirect uri');

        if (client_id !== 'MOCK_CLIENT_ID')
            throw new BadRequest('Bad client ID');

        logger.debug('redirecting to', redirect_uri);
        res.statusCode = 302;
        res.setHeader('Location', `${redirect_uri}?code=AUTHORZTN_CODE&scope=${scope}`);
    });

};