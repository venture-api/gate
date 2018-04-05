const {Router} = require('express');
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

        const {cheme, host, port} = req.app.get('config');
        const logger = req.app.get('logger');
        const passport = req.app.get('passport');
        const {authService} = req.params;

        logger.debug(`returning ${authService} callback...`);

        return passport[action](authService, {
            session: false,
            callbackURL: `${scheme}://${host}:${port}/auth/${authService}/callback` // TODO investigate if its really needed here
        })(req, res, next);

    },


    // AUTHENTICATION CALLBACK

    (req, res, next) => {

        if (req.account) return next();
        const logger = req.app.get('logger');
        const {service} = req.params;

        logger.debug(`processing ${service} authentication callback...`);
        const {accessToken, refreshToken, profile} = req.user;
        const {id, displayName, username} = profile;
        const name = displayName || username;
        const email = profile.emails[0].value;

        const config = req.app.get('config');
        const nats = req.app.get('nats');

        if (!email) return next('no email in profile');

        waterfall([

            (federatedDataProcessed) => {
                logger.debug(`processing ${service} data...`);
                nats.request('account.fed.auth', {
                    service,
                    profile: {name, email},
                    credentials: {
                        id,
                        accessToken,
                        refreshToken,
                        username
                    }
                }, federatedDataProcessed);
            },

            ensureAsync((account, redirectFormed) => {
                let redirectPath;
                if (account.status === 'new') {
                    logger.debug('issuing confirmation token...');
                    nats.request('auth.login', {userId: account.id}, (error, {jwt}) => {
                        if(error) return redirectFormed(error);
                        redirectPath = `/confirm/${jwt}`;
                        redirectFormed(null, redirectPath);
                    });
                } else if (account.credentials && account.credentials.twofa) {
                    logger.debug(`2fa is enabled for user ${account.id}`);
                    redirectPath = `/twofa/${account.id}`;
                    return redirectFormed(null, redirectPath);
                } else {
                    logger.debug(`issuing auth token for user ${account.id}`);
                    nats.request('auth.login', {userId: account.id}, (error, {jwt}) => {
                        if (error) return redirectFormed(error);
                        redirectPath = `/login/${jwt}`;
                        redirectFormed(null, redirectPath);
                    });
                }
            })

        ], (error, redirectPath) => {
            if (error) {
                redirectPath = `/error/${error.message}`;
            }
            logger.debug('redirecting to', redirectPath);
            res.redirect(`${config.frontend}${redirectPath}`);
        });

    },

);


module.exports = authRouter;