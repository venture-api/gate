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
        const guid = await stair.write('factory.create', {
            id,
            name,
            ownerId
        });
        res.body = {guid};
        res.status(201);
        next();
    });

module.exports = factoryRouter;
