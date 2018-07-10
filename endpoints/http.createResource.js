module.exports = async (gate, logger) => {

    const {fastify, tasu, stair} = gate.get();
    const {middleware} = gate.modules;

    const conf = {
        beforeHandler: await middleware.authorize()
    };

    fastify.post('/resources', conf, async(req, res) => {

        const {id: location, type, resourseType, code, ownerId, region} = req.facility;

        logger.debug('generating resource ID');
        const id = await tasu.request('generateId.resource', {type: resourseType, code});

        // get region for defects
        logger.debug('getting regional defects for:', region);
        const {defects} = await tasu.request('getRegion', {name: region});
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
        const guid = await stair.write('createResource', newResource);

        res.header('x-guid', guid);
        res.code(201);

        return newResource;
    })
};
