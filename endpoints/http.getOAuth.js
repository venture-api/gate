module.exports = async (gate, logger) => {

    const { config, oauth } = gate.state;
    const { HTTP } = gate.services;
    const { environment, http: {scheme, host, port }} = config;
    const entrypoint = `${scheme}://${host}:${port}`;

    const schema = {
        params: {
            service: {type: 'string', enum: Object.keys(oauth)}
        }
    };

    HTTP.addRoute({
        method: 'GET',
        pathname: '/oauth/:id'
    }, async(req, res) => {

        const service = req.resourceId;
        if (service === 'mock' && ! ['test', 'ci'].includes(environment))
            throw new Error('Mock service is only allowed in test environment');
        logger.debug('authenticating via:', service);
        const authorizationUri = oauth[service].authorizationCode.authorizeURL({
            redirect_uri: `${entrypoint}/oauth/${service}/callback`
        });
        logger.debug('redirecting to', authorizationUri);
        res.writeHead(302, { 'Location': authorizationUri });
        res.end();
    })
};
