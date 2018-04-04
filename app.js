const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
require('express-async-errors');
const morgan = require('morgan');
const Tasu = require('tasu');
const Stair = require('stair');
const routers = require('./routers');
const errorHandler = require('./middleware/errorHandler');
const responseSender = require('./middleware/responseSender');
const logger = require('./logger');
const configLoader = require('yt-config');
const pack = require('./package.json');


const app = express();
app.set('logger', logger);

app.use(morgan(':date[iso] gate INFO request :remote-addr :method :url :status :response-time ms'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bearerToken());
app.use(routers());
app.use(errorHandler);
app.use(responseSender);


module.exports = async () => {

    const config = await configLoader('config.ini');
    app.set('config', config);
    app.set('package', pack);


    // TASU

    const tasu = new Tasu(config.tasu);
    await tasu.connected();
    app.set('tasu', tasu);


    // STAIR

    const stair = new Stair(config.stair);
    await stair.connected();
    app.set('stair', stair);


    // HTTP SERVER

    const server = http.createServer(app);
    app.set('server', server);

    return app;
};
