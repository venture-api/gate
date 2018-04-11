const {Router} = require('express');
const ReqError = require('../util/ReqError');
const issueJWT = require('../util/issueJWT');
const playerId = require('../util/playerId');
const validate = require('../middleware/validation');


const authRouter = Router({});


// INITIAL CALL

authRouter.get('/:authService', validate('authService'), (req, res, next) => {

    const {environment, scheme, host, port} = req.app.get('config');
    const logger = req.app.get('logger');
    const passport = req.app.get('passport');
    const {authService} = req.params;
    if (authService === 'mock' && environment !== 'test')
        return next(new Error('mock service is only allowed in test environment'));
    logger.debug(`processing ${authService} initial auth call`);
    return passport.authenticate(authService, {
        callbackURL: `${scheme}://${host}:${port}/auth/${authService}/callback`})(req, res, next);

});


// CALLBACK

authRouter.get('/:authService/callback', validate('authService'), (req, res, next) => {

        const logger = req.app.get('logger');
        const passport = req.app.get('passport');
        const {scheme, host, port} = req.app.get('config');
        const {authService} = req.params;

        logger.debug(`returning ${authService} callback`);

        return passport.authenticate(authService, {
            session: false,
            callbackURL: `${scheme}://${host}:${port}/auth/${authService}/callback`
        })(req, res, next);

    },


    // AUTHENTICATION CALLBACK

    async (req, res, next) => {

        const logger = req.app.get('logger');
        const stair = req.app.get('stair');
        const {authService} = req.params;

        logger.debug(`processing ${authService} authentication callback`);
        const {profile} = req.user;
        const {displayName, username, emails} = profile;
        const name = displayName || username;
        const email = emails[0].value;

        const config = req.app.get('config');
        const tasu = req.app.get('tasu');

        if (!email)
            throw new ReqError(400, 'no email in profile');

        const existingPlayer = await tasu.request('player.identify', {email});
        let player;
        if (existingPlayer) {
            logger.debug('existing player, issuing token', existingPlayer);
            player = existingPlayer;
        } else {
            logger.debug('new player, registering', email);
            const id = playerId();
            player = {id, email, name};
            await stair.write('player.register', player);
        }
        const {frontend: {entrypoint}, jwt: {secret}} = config;

        const jwt = await issueJWT({t: 'player', i: player.id}, secret);
        res.redirect(`${entrypoint}/login?token=${jwt}`);
    },

);


module.exports = authRouter;