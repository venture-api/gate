const {Router} = require('express');
const resourceId = require('../util/resourceId');
const authorize = require('../middleware/authorization');


const rawRouter = Router({});


// LIST TEAMS

rawRouter.post('/', authorize('factory'), async (req, res, next) => {

    const {type, code} = req.factory;
    const {can, reason, nextTerm} = await canProduce(code);
    const stair = req.app.get('stair');
    let guid;

    if (can) {
        const id = resourceId({type, code});
        guid = await stair.write('produce', {
            type,
            id,
            factoryCode: code
        });
        res.status(201);
        res.set('next', nextTerm);
        res.body = {resourceId};

    } else {
        guid = await stair.write('waste', {reason, factoryId: id});
        res.body = {reason};
    }
    res.set('quid', guid);
    next();
});

module.exports = rawRouter;
