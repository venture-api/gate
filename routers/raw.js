const {Router} = require('express');
const authorize = require('../middleware/authorization');

const rawRouter = Router();


// LIST TEAMS

rawRouter.get('/coal', authorize(), (req, res, next) => {

    const tasu = req.app.get('tasu');

    tasu.request('team.list', {criteria: {ownerId}, offset, limit}, (error, list) => {
        res.body = list;
        next(error);
    });
});
