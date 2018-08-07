const simpleOAuth2 = require('simple-oauth2');
const Kojo = require('kojo');
const configLoader = require('yt-config');
const Tasu = require('tasu');
const Stair = require('stair');
const TRID = require('trid');


module.exports = async () => {

    const config = await configLoader('config.ini');

    // Kojo
    const gate = new Kojo(config.kojo);
    gate.set('config', config);

    // HTTP Router
    gate.set('routes', {});

    // trid
    gate.set('trid', new TRID({prefix: gate.id, length: 4}));

    // Tasu
    const tasu = new Tasu(config.tasu);
    await tasu.connected();
    gate.set('tasu', tasu);

    // Stair
    const stair = new Stair(config.stair);
    await stair.connected();
    gate.set('stair', stair);

    // Simple OAuth2
    const oauth = {};
    Object.entries(config.oauth2).forEach(([service, config]) => {
        oauth[service] = simpleOAuth2.create(config);
    });
    gate.set('oauth', oauth);

    await gate.ready();

    const {http} = gate.modules;
    const server = await http.listen();
    gate.set('httpServer', server);

    return gate;
};
