import facProps from '@venture-api/fixtures/validation/facility.js';
import resProps from '@venture-api/fixtures/validation/resource.js';
import w from '@venture-api/fixtures/dictionary/words.js';
import t from '@venture-api/fixtures/dictionary/topics.js';


export default async (gate, logger) => {

    const { stair, tasu } = gate.state;
    const { HTTP } = gate.services;

    HTTP.addRoute({

        method: 'POST',
        pathname: `/transport-orders`,
        access: [ 'playerId', w.transport, 'resourceId', 'facilityId' ],
        schema: {
            body: {
                type: 'object',
                properties: { resourceId: resProps.id, destinationId: facProps.properties.id }},
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
