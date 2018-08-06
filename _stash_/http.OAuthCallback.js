const issueJWT = require('../util/issueJWT');
const {UnprocessableEntity} = require('http-errors');


module.exports = async (kojo, logger) => {

    const {fastify, config, oauth, stair, tasu} = kojo.get();

    const schema = {
        params: {
            service: {
                type: 'string',
                enum: Object.keys(oauth)
            }
        }
    };

    fastify.get('/oauth/:service/callback', {schema}, async(req, res) => {

        const {service} = req.params;
        const {code} = req.query;
        logger.debug(`processing '${service}' callback`);
        const result = await oauth[service].authorizationCode.getToken({code});
        const {token} = oauth[service].accessToken.create(result);
        const {displayName, username, emails} = token.info;
        const name = displayName || username;
        const [email] = emails;

        if (!email)
            throw new UnprocessableEntity('no email in profile');

        const existingPlayer = await tasu.request('identifyPlayer', {email});
        let player;
        if (existingPlayer) {
            logger.debug('existing player, issuing token', existingPlayer);
            player = existingPlayer;
        } else {
            logger.debug('new player, registering', email);
            const id = await tasu.request('generateId.player', {});
            player = {id, email, name};
            await stair.write('registerPlayer', player);
        }
        const {frontend: {entrypoint}, jwt: {secret}} = config;

        const jwt = await issueJWT({t: 'player', i: player.id}, secret);
        res.redirect(`${entrypoint}/login?token=${jwt}`);
    });
};
