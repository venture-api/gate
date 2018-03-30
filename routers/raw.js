const {Router} = require('express');
const resourceId = require('../util/resourceId');
const getFactory = require('../middleware/getFactory');


const rawRouter = Router();


// LIST TEAMS

rawRouter.post('/produce', getFactory(), async (req, res, next) => {

    const {type, code} = req.factory;
    const {can, reason, nextTerm} = await canProduce(code);
    const command = req.app.get('command');
    let guid;

    if (can) {
        const id = resourceId({type, code});
        guid = await command.write('produce', {
            type,
            id,
            factoryCode: code
        });
        res.status(201);
        res.set('next', nextTerm);
        res.body = {resourceId};

    } else {
        guid = await command.write('waste', {reason, factoryId: id});
        res.body = {reason};
    }
    res.set('quid', guid);
    next();
});

module.exports = rawRouter;
