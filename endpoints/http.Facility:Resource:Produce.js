const w = require('@venture-api/fixtures/dictionary/words');
const k = require('@venture-api/fixtures/dictionary/keys');
const t = require('@venture-api/fixtures/dictionary/topics');


module.exports = async (gate, logger)  => {

    const { tasu, stair } = gate.state;
    const { HTTP } = gate.services;

    HTTP.addRoute({

        method: 'GET',
        pathname: `/${w.resources}`,
        access: [ k.facilityId, w.produce ],
    }, async (req, res) => {

        const { facility } = req;

        logger.debug(`requesting resource data`);
        const resourceData = await tasu.request(`${w.facility}.${w.resource}.prepare`, { facility });

        logger.info(`dispatching resource produced event`);
        const guid = await stair.write(t.resourceProduced, resourceData);

        res.setHeader('x-guid', guid);
        res.statusCode = 201;
        return resourceData;
    });
};
