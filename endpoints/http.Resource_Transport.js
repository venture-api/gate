const { properties: { id: facilityId } } = require('@venture-api/fixtures/schemata/facility');
const { id: resourceId } = require('@venture-api/fixtures/schemata/resource');
const w = require('@venture-api/fixtures/dictionary/words');
const t = require('@venture-api/fixtures/dictionary/topics');


module.exports = async (gate, logger) => {

    const { stair, tasu } = gate.state;
    const { HTTP } = gate.services;

    HTTP.addRoute({

        method: 'POST',
        pathname: `/transport-orders`,
        access: [ 'playerId', w.transport, 'resourceId', 'facilityId' ],
        schema: {
            body: {
                type: 'object',
                properties: { resourceId, destinationId: facilityId }},
        }

    }, async (req, res) => {

        const { resourceId, destinationId } = req.body;

        logger.debug('generating transport order id');
        const orderId = await tasu.request(t.generateTransportOrderId, {});

        logger.debug(`ordering transport for ${resourceId} to ${destinationId}: ${orderId}`);
        const guid = await stair.write(t.transportOrdered, { id: orderId, resourceId, destinationId });

        res.setHeader('x-guid', guid);
        res.statusCode = 204;
    })
};
