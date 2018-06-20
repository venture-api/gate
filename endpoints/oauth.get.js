module.exports = async (gate, logger) => {

    const {fastify, config, oauth} = gate.get();
    const {environment, http: {scheme, host, port}} = config;
    const entrypoint = `${scheme}://${host}:${port}`;

    const schema = {
        params: {
            type: 'object',
            properties: {
                service: {type: 'string', enum: Object.keys(oauth)},
            }
        }
    };

    fastify.get('/oauth/:service', {schema}, async(req, res) => {

        const {service} = req.params;
        if (service === 'mock' && !['test', 'ci'].includes(environment))
            throw new Error('mock service is only allowed in test environment');
        logger.debug('authenticating via', service);
        const authorizationUri = oauth[service].authorizationCode.authorizeURL({
            redirect_uri: `${entrypoint}/oauth/${service}/callback`
        });
        res.redirect(authorizationUri);
    })
};
