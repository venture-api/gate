const issueJWT = require('../util/issueJWT');
const ReqError = require('../util/ReqError');


module.exports = async (gate, logger) => {

    const { config, oauth, stair, tasu } = gate.state;
    const { HTTP } = gate.services;

    const schema = {
        params: {
            service: {
                type: 'string',
                enum: Object.keys(oauth)
            }
        }
    };

    HTTP.addRoute({
        method: 'GET',
        pathname: '/oauth/:id/callback'
    }, async(req, res) => {

        const service = req.resourceId;
        const {code} = req.query;
        logger.debug(`processing '${service}' callback`);
        const result = await oauth[service].authorizationCode.getToken({code});
        const {token} = oauth[service].accessToken.create(result);
        const {displayName, username, emails} = token.info;
        const name = displayName || username;
        const [email] = emails;

        if (!email)
            throw new ReqError(422, 'No email in profile');

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
        res.writeHead(302, {
            'Location': `${entrypoint}/login?token=${jwt}`
        });
        res.end();
    });
};
