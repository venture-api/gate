const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const passport = require('passport');
require('express-async-errors');
const morgan = require('morgan');
const Tasu = require('tasu');
const Stair = require('stair');
const configLoader = require('yt-config');
const routers = require('./routers');
const errorHandler = require('./errorHandler');
const responseSender = require('./responseSender');
const logger = require('./logger');
const mockStrategy = require('./strategies/mock');
const googleStrategy = require('./strategies/google');
const pack = require('./package.json');


const gate = express();
gate.set('logger', logger);

gate.enable('trust proxy');
gate.use(morgan('dev', {
    skip: () => {return process.env.LOG_LEVEL !== 'debug' }
}));
gate.use(bodyParser.urlencoded({extended: true}));
gate.use(bodyParser.json());
gate.use(bearerToken());
gate.use(routers);
gate.use(errorHandler);
gate.use(responseSender);


module.exports = async () => {

    const config = await configLoader('config.ini');
    gate.set('config', config);
    gate.set('package', pack);


    // PASSPORT

    passport.use('google', googleStrategy(config.google));
    passport.use('mock', mockStrategy(config));
    gate.use(passport.initialize());
    gate.set('passport', passport);


    // TASU

    const tasu = new Tasu(config.tasu);
    await tasu.connected();
    gate.set('tasu', tasu);


    // STAIR

    const stair = new Stair(config.stair);
    await stair.connected();
    gate.set('stair', stair);


    // HTTP SERVER

    const server = http.createServer(gate);
    gate.set('server', server);

    return gate;
};
