import httpErrors from 'http-errors';
const { Conflict } = httpErrors;
import facilitySchema from '@venture-api/fixtures/validation/facility.js';
import w  from '@venture-api/fixtures/dictionary/words.js';
import t from '@venture-api/fixtures/dictionary/topics.js';


export default async (gate, logger) => {

    const { tasu, stair } = gate.state;
    const { HTTP } = gate.services;

    HTTP.addRoute({

        method: 'POST',
        pathname: `/${w.facilities}`,
        access: [ 'playerId', 'create', w.facility ],
        schema: { body: facilitySchema }

    }, async (req, res) => {

        const { principalId: ownerId, body: { code: customCode, type, resourceType, name }} = req;
        let generatedCode;

        if (customCode) {
            logger.debug(`checking existing ${w.facilities} with code`, customCode);
            const facility = await tasu.request('identify', { code: customCode });

            if (facility) {
                res.header('Location', `/${w.facilities}/${customCode}`);
                throw new Conflict(`${w.facility} with code ${customCode} already exists`);
            }
        } else {
            logger.debug('generating code');
            generatedCode = tasu.request(t.generateFacilityCode, { type, name, ownerId });
        }

        logger.debug('generating unique id');
        const code = customCode || generatedCode;
        const id = await tasu.request(t.generateFacilityId, { type, resourceType });

        logger.info(`dispatching ${w.facility} creation`, id);
        const guid = await stair.write(t.facilityCreated, { id, name, ownerId, code });
        res.setHeader('x-guid', guid);

        logger.debug(`requesting token`);
        const token = await tasu.request('token.sign', { id });

        res.setHeader('x-token', token);
        res.statusCode = 201;

        return { id, name, ownerId, code, type };
    })
};
