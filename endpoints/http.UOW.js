import {
    words as w,
    actions as a,
    keys as k,
    topics as t
} from '@venture-api/fixtures/dictionary';


export default async (gate, logger) => {

    const { HTTP } = gate.services;
    const { stair } = gate.state;

    HTTP.addRoute({

        method: 'POST',
        pathname: `/${w.worker}s/:id/uow`,
        access: [ k.workerId, a.create, w.UOW ]

    }, async (req, res) => {

        const { id: workerId } = req;

        logger.info(`${workerId} does some work`);
        const guid = await stair.write(t.UOW, { workerId });
        res.setHeader('x-guid', guid);

        res.setHeader('x-tired-till', nowPlusWorkerLevelDelay);

        res.statusCode = 201;
    })
};
