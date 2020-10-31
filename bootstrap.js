const Fastify = require('fastify');
const formbody = require('fastify-formbody');
const simpleOAuth2 = require('simple-oauth2');
const Kojo = require('kojo');
const configLoader = require('yt-config');
const Tasu = require('tasu');
const Stair = require('stair');


module.exports = async () => {

    const config = await configLoader('config.ini');

    // Kojo
    const gate = new Kojo(config.kojo);
    gate.set('config', config);

    // Fastify
    const fastify = Fastify({});
    fastify.setErrorHandler((error, req, res) => {
        const {params, query, body} = req;
        res.send(error);
        console.log(req.raw.method, req.raw.originalUrl, {params, query, body});
        console.error(error);
    });
    fastify.register(formbody);
    gate.set('fastify', fastify);

    // Tasu
    const tasu = new Tasu(config.tasu);
    await tasu.connected();
    gate.set('tasu', tasu);

    // Stair
    const stair = new Stair(config.stair);
    await stair.connected();
    gate.set('stair', stair);

    // Simple OAuth2
    const oauth = {};
    Object.entries(config.oauth2).forEach(([service, config]) => {
        oauth[service] = simpleOAuth2.create(config);
    });
    gate.set('oauth', oauth);

    await gate.ready();
    await fastify.listen(config.http.port);
    return gate;
};
