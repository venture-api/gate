const {Router} = require('express');


const mockOAuthRouter = Router({});

mockOAuthRouter.get('/auth', async (req, res, next) => {

    const {response_type, redirect_uri, scope, client_id} = req.query;

    res.status(200);
    res.body = req.query;
    next();
});

mockOAuthRouter.get('/callback', async (req, res, next) => {

    const {response_type, redirect_uri, scope, client_id} = req.query;

    res.status(200);
    res.body = req.query;
    next();
});

module.exports = mockOAuthRouter;
