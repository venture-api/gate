const {Router} = require('express');
const ReqError = require('../util/ReqError');
const issueJWT = require('../util/issueJWT');
const validate = require('../middleware/validation');


const authRouter = Router();


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
        const {authService} = req.params;

        logger.debug(`returning ${authService} callback`);

        return passport.authenticate(authService, {session: false})(req, res, next);

    },


    // AUTHENTICATION CALLBACK

    async (req, res, next) => {

        const logger = req.app.get('logger');
        const stair = req.app.get('stair');
        const {authService} = req.params;

        logger.debug(`processing ${authService} authentication callback`);
        const {accessToken, refreshToken, profile} = req.user;
        const {id, displayName, username, emails} = profile;
        const name = displayName || username;
        const email = emails[0].value;

        const config = req.app.get('config');
        const tasu = req.app.get('tasu');

        if (!email)
            throw new ReqError(400, 'no email in profile');

        let guid;
        const player = await tasu.request('player.identify', {email});
        if (player) {
            logger.debug('existing player, issuing token', player);
        } else {
            logger.debug('new player, registering', player);
            guid = stair.write('player.register', {email, name});
        }
        const {frontend: {entrypoint}, jwt: {secret}} = config;
        const jwt = await issueJWT({g: guid, e: email}, secret);
        res.redirect(`${entrypoint}/login?token=${jwt}`);
    },

);


module.exports = authRouter;