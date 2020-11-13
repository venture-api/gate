import { topics as t, words as w, phrases as ph } from '@venture-api/fixtures/dictionary';
import { worker as workerSchema } from '@venture-api/fixtures/validation';


export default function (gate, logger) {

    const { tasu, stair } = gate.state;
    const { HTTP } = gate.methods;

    HTTP.addRoute({
        method: 'POST',
        pathname: `/${w.worker}s`,
        access: [ ph.gameMaster, w.spawn, w.worker ],
        schema: {
            body: {
                name: workerSchema.properties.name,
                level: workerSchema.properties.level
            }
        }
    }, async (req, res) => {

        const { name, level } = req;

        logger.debug('requesting id for', { name });
        const id = await tasu.request(t.generateWorkerId, { type: w.human });

        logger.info(`dispatching ${w.worker} spawn event`, id);
        const guid = await stair.write(t.workerSpawned, { id, name, level });
        res.setHeader('x-guid', guid);


    });
}
