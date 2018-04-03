const {Router} = require('express');
const authorize = require('../middleware/authorization');


const factoryRouter = Router({});


// CREATE

factoryRouter.post('/', authorize('user'), async (req, res, next) => {

    const {id: ownerId} = req.player;
    const stair = req.app.get('stair');
    const {name} = req.body;
    const guid = await stair.write('factory.create', {
        name,
        ownerId
    });
    res.body = {guid};
    res.status(201);
    next();
});

module.exports = factoryRouter;
