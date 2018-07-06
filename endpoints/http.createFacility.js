const {Conflict} = require('http-errors');
const issueJWT = require('../util/issueJWT');
const name = require('@venture-api/fixtures/schemata/facility/name');
const {factory, warehouse} = require('@venture-api/fixtures/constants/facility');


module.exports = async (gate, logger) => {

    const {fastify, tasu, stair, config} = gate.get();
    const {middleware} = gate.modules;

    const conf = {
        schema: {
            body: {
                type: 'object',
                properties: {
                    name,
                    code: {type: 'string', minLength: 3, maxLength: 6},
                    type: {type: 'string', enum: [factory, warehouse]},
                },
                required: ['name', 'code', 'type']
            }
        },
        beforeHandler: await middleware.authorize('player')
    };

    fastify.post('/facilities', conf, async(req, res) => {

        const {player, body: {code, type, name}} = req;
        const {id: ownerId} = player;
        const {jwt: {secret}} = config;

        logger.debug('checking existing facilities', {code});
        const factory = await tasu.request('identifyFacility', {code});

        if (factory) {
            res.header('Location', `/facilities/${code}`);
            throw new Conflict(`facility with code ${code} already exists`);
        }

        const id = await tasu.request('generateId.facility', {entity: 'facility', type: 'factory', code});
        const newFacility = {id, name, ownerId, type, code};

        logger.info('creating facility', type, id);
        const guid = await stair.write('createFacility', newFacility);
        const token = await issueJWT({t: 'facility', i: id}, secret);

        res.header('x-guid', guid);
        res.header('x-token', token);
        res.code(201);

        return newFacility;
    })
};
