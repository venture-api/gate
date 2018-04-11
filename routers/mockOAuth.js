const {Router} = require('express');
const ReqError = require('../util/ReqError');


const mockOAuthRouter = Router({});


mockOAuthRouter.get('/auth', async (req, res, next) => {

    const {redirect_uri, scope, client_id} = req.query;
    const {scheme, host, port} = req.app.get('config');
    const logger = req.app.get('logger');
    logger.debug('authenticating', client_id, redirect_uri);
    const registeredURIs = [`${scheme}://${host}:${port}/auth/mock/callback`];
    if (!registeredURIs.includes(redirect_uri))
        throw new ReqError(400, 'bad redirect_uri');
    if (client_id !== 'MOCKCLIENTID')
        throw new ReqError(400, 'bad client id');
    res.redirect(`${redirect_uri}?code=AUTHORZTN_CODE&scope=${scope}`);
    next();
});


mockOAuthRouter.post('/token', async (req, res, next) => {

    const logger = req.app.get('logger');
    const {client_id} = req.body;

    logger.debug('issuing token to', client_id);
    res.body = {
        "access_token":"MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3",
        "token_type":"bearer",
        "expires_in":3600,
        "refresh_token":"IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk",
        "scope":"create",
        "info": {emails: ['email@one.com']}
    };
    next();
});

module.exports = mockOAuthRouter;
