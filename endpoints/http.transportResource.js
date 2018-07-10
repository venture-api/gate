const {id: facilityId} = require('@venture-api/fixtures/schemata/facility');
const {id: resourceId} = require('@venture-api/fixtures/schemata/resource');


module.exports = async (gate, logger) => {

    const {fastify, stair} = gate.get();
    const {middleware} = gate.modules;

    const conf = {
        schema: {
            body: {type: 'object', properties: {location: facilityId}},
            params: {type: 'object', properties: {id: resourceId}},
        },
        beforeHandler: await middleware.authorize('location')
    };

    fastify.patch('/resources/:id', conf, async(req, res) => {

        const {id} = req.params;
        const {location} = req.body;
        logger.debug(`moving ${id} to ${location}`);
        const guid = await stair.write('transportResource', {id, location});
        res.header('x-guid', guid);
        res.code(204);
    })
};
