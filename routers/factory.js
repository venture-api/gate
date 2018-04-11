const {Router} = require('express');
const authorize = require('../middleware/authorization');
const validate = require('../middleware/validation');
const factoryId = require('../util/factoryId');


const factoryRouter = Router({});


// CREATE

factoryRouter.post('/',
    authorize('player'),
    validate('factory:name', 'factory:type', 'factory:code'),
    async (req, res, next) => {

        const {id: ownerId} = req.player;
        const stair = req.app.get('stair');
        const {name, type, code} = req.body;
        const id = factoryId({type, code});
        const newFactory = {id, name, ownerId, type, code};
        const guid = await stair.write('factory.create', newFactory);
        res.body = newFactory;
        res.set('x-guid', guid);
        res.status(201);
        next();
    });

module.exports = factoryRouter;
