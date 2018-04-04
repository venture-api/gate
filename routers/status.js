const {Router} = require('express');


const statusRouter = Router({});

statusRouter.get('/', async (req, res, next) => {

    const tasu = req.app.get('tasu');
    const mold = await tasu.request('mold.status', {});
    res.body = {mold};
    next();
});

module.exports = statusRouter;
