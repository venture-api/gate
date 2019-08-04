const w = require('@venture-api/fixtures/dictionary/words');
const k = require('@venture-api/fixtures/dictionary/keys');
const t = require('@venture-api/fixtures/dictionary/topics');


module.exports = async (gate, logger)  => {

    const { tasu, stair } = gate.state;
    const { HTTP } = gate.services;

    HTTP.addRoute({

        method: 'GET',
        pathname: `/${w.resource}`,
        access: [ k.facilityId, w.produce ]

    }, async (req, res) => {

        const { principalId } = req;

        logger.debug(`requesting resource data`);
        const resourceData = await tasu.request(t.requestResourceData, { facilityId: principalId });

        logger.info(`dispatching resource produced event`);
        const guid = await stair.write(t.resourceProduced, resourceData);

        res.setHeader('x-guid', guid);
        res.statusCode = 201;
        return resourceData;
    });
};
