import simpleOAuth2 from 'simple-oauth2';
import Kojo from 'kojo';
import configLoader from 'yt-config';
import Tasu from 'tasu';
import Stair from 'stair';
import TRID from 'trid';


export default async function () {

    const config = await configLoader('config.ini');

    // Kojo
    const gate = new Kojo(config.kojo);
    gate.set('config', config);

    // HTTP Router
    gate.set('routes', {});

    // trid
    gate.set('trid', new TRID({ prefix: gate.id, length: 4 }));

    // Tasu
    // const tasu = new Tasu(config.tasu);
    // await tasu.connected();
    // gate.set('tasu', tasu);

    // Stair
    // const stair = new Stair(config.stair);
    // await stair.connected();
    // gate.set('stair', stair);

    // Simple OAuth2
    const oauth = {};
    Object.entries(config.oauth2).forEach(([ service, config ]) => {
        oauth[service] = simpleOAuth2.create(config);
    });
    gate.set('oauth', oauth);

    await gate.ready();

    const { HTTP } = gate.services;
    gate.set('httpServer', await HTTP.listen());

    return gate;
};
