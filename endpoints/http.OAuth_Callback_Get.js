import httpErrors from 'http-errors';
const { UnprocessableEntity } = httpErrors;
import w  from '@venture-api/fixtures/dictionary/words.js';
import t from '@venture-api/fixtures/dictionary/topics.js';


export default async (gate, logger) => {

    const { config, oauth, stair, tasu } = gate.state;
    const { HTTP } = gate.methods;

    HTTP.addRoute({

        method: 'GET',
        pathname: '/oauth/:id/callback'

    }, async (req, res) => {

        const service = req.resourceId;
        const { code } = req.query;

        logger.debug(`processing '${service}' callback`);
        const result = await oauth[service].authorizationCode.getToken({ code });
        const { token } = oauth[service].accessToken.create(result);
        const { displayName, username, emails } = token.info;
        const name = displayName || username;
        const [ email ] = emails;

        if (!email)
            throw new UnprocessableEntity('No email in profile');

        logger.debug(`requesting ${w.player} identification`);
        const existingPlayer = await tasu.request('identify', { email });
        let player;

        if (existingPlayer) {
            logger.debug('existing player, issuing token', existingPlayer);
            player = existingPlayer;
        } else {
            logger.debug('new player, registering', email);
            const id = await tasu.request(t.generateId, { type: w.player });
            player = {id, email, name};
            await stair.write(t.playerRegistered, player);
        }

        const { frontend: { entrypoint }, jwt: { secret }} = config;
        const jwt = await tasu.request(t.signToken, { id: player.id }, secret);

        res.setHeader('Location', `${entrypoint}/login?token=${jwt}`);
        res.statusCode = 302;
    });
};
