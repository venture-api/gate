const {Router} = require('express');
const authorize = require('../middleware/authorization');


const factoryRouter = Router({});


// CREATE

factoryRouter.post('/',
    authorize('factory'),
    async (req, res, next) => {

        const {factory, app} = req;
        const {type, code, ownerId, region} = factory;
        const stair = app.get('stair');
        const tasu = app.get('tasu');

        const id = await tasu.request('resource.id', {type, code});
        const defects = await tasu.request('defects.get', {region, type});
        const newResource = {
            id,
            ownerId,
            type,
            code,
            defects,
            location: factory.id
        };
        const guid = await stair.write('resource.create', newResource);
        res.body = newResource;
        res.set('x-guid', guid);
        res.status(201);
        next();
    });

module.exports = factoryRouter;
