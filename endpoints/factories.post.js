const {Conflict} = require('http-errors');
const issueJWT = require('../util/issueJWT');


module.exports = async (gate, logger) => {

    const {fastify, tasu, stair, config} = gate.get();
    const {middleware} = gate.modules;

    const conf = {
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: {type: 'string', minLength: 3, maxLength: 50},
                    code: {type: 'string', minLength: 3, maxLength: 6},
                    type: {type: 'string', enum: ['iron ore', 'coal']},
                }}
        },
        beforeHandler: await middleware.authorize('player')
    };

    fastify.post('/factories', conf, async(req, res) => {

        const {player, body: {code, type, name}} = req;
        const {id: ownerId} = player;
        const {jwt: {secret}} = config;

        logger.debug('checking existing factories', {code});
        const factory = await tasu.request('factory.identify', {code});

        if (factory) {
            res.header('Location', `/factories/${code}`);
            throw new Conflict(`factory with code ${code} already exists`);
        }

        const id = await tasu.request('factory.id', {type, code});
        const newFactory = {id, name, ownerId, type, code};
        const guid = await stair.write('factory.create', newFactory);
        const token = await issueJWT({t: 'factory', i: id}, secret);
        res.header('x-guid', guid);
        res.header('x-token', token);
        res.code(201);

        return newFactory;
    })
};
