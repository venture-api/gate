const facilityId = require('@venture-api/fixtures/schemata/facility/id');


module.exports = async (gate, logger) => {

    const {fastify, tasu, stair} = gate.get();
    const {middleware} = gate.modules;

    const conf = {
        schema: {body: {type: 'object', properties: {location: facilityId}}},
        beforeHandler: await middleware.authorize('transport')
    };

    fastify.patch('/resources/:id', conf, async(req, res) => {

        const {id: location, type, code, ownerId, region} = req.factory;

        logger.debug('generating resource ID');
        const id = await tasu.request('resource.id', {type, code});

        // get region for defects
        logger.debug('getting regional defects for:', region);
        const {defects} = await tasu.request('region.get', {name: region});
        const newResource = {
            id,
            ownerId,
            type,
            code,
            defects,
            location,
            producedAt: location
        };
        logger.info('creating resource:', type, id);
        const guid = await stair.write('resource.create', newResource);

        res.header('x-guid', guid);
        res.code(201);

        return newResource;
    })
};
