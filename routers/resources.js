const {Router} = require('express');
const authorize = require('../middleware/authorization');


const resourseRouter = Router({});


// CREATE

resourseRouter.post('/', authorize('factory'), async (req, res, next) => {

        const {factory, app} = req;
        const {type, code, ownerId, region} = factory;
        const stair = app.get('stair');
        const tasu = app.get('tasu');

        // generate resource ID
        const id = await tasu.request('resource.id', {type, code});

        // get region for defects
        const {defects} = await tasu.request('region.get', {name: region});
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

module.exports = resourseRouter;
