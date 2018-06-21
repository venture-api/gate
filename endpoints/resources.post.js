const {Conflict} = require('http-errors');
const issueJWT = require('../util/issueJWT');


module.exports = async (gate, logger) => {

    const {fastify, tasu, stair, config} = gate.get();
    const {middleware} = gate.modules;

    const conf = {
        beforeHandler: await middleware.authorize('factory')
    };

    fastify.post('/resources', conf, async(req, res) => {

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
