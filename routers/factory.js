const {Router} = require('express');
const {matchedData} = require('express-validator/filter');
const issueJWT = require('../util/issueJWT');
const authorize = require('../modules/middleware/index');
const validate = require('../modules/middleware/validation');


const factoryRouter = Router({});


// CREATE

factoryRouter.post('/',
    authorize('player'),
    validate('factory:name', 'factory:type', 'factory:code'),
    async (req, res, next) => {

        const {player, app} = req;
        const {name, type, code} = matchedData(req, {locations: ['body']});
        const {id: ownerId} = player;
        const stair = app.get('stair');
        const tasu = app.get('tasu');
        const {jwt: {secret}} = app.get('config');

        const id = await tasu.request('factory.id', {type, code});
        const newFactory = {id, name, ownerId, type, code};
        const guid = await stair.write('factory.create', newFactory);
        const token = await issueJWT({t: 'factory', i: id}, secret);
        res.body = newFactory;
        res.set('x-guid', guid);
        res.set('x-token', token);
        res.status(201);
        next();
    });

module.exports = factoryRouter;
