const express = require('express');
const validate = require('../middleware/validation');


const authRouter = express.Router();

module.exports = (passport) => {

    const OPTIONS = {
        google: {
            accessType: 'offline'
        }
    };

    // INITIAL CALL

    authRouter.get('/:service', validate('service'), (req, res, next) => {

        const config = req.app.get('config');
        const logger = req.app.get('logger');
        const token = req.token || req.query.token;
        if (token) return next();


        // AUTHENTICATION CALL

        const {service} = req.params;
        if (service === 'mock' && config.environment !== 'test')
            return next(new Error('mock service is only allowed in test environment'));
        logger.debug(`processing ${service} initial auth call...`);
        return passport.authenticate(service, {callbackURL: `${config.gateway}/auth/${service}/callback`})(req, res, next);

    });


    // CALLBACK

    authRouter.get('/:service/callback',

        (req, res, next) => {
            if (!valid(['service'], req, next)) return;
            const {gateway} = req.app.get('config');
            const logger = req.app.get('logger');
            const {service} = req.params;
            const {state} = req.query;

            let action = state ? 'authorize' : 'authenticate';
            logger.debug(`returning ${service} ${action} callback...`);

            return passport[action](service, {
                session: false,
                callbackURL: `${gateway}/auth/${service}/callback` // TODO investigate if its really needed here
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

    return authRouter;
};
