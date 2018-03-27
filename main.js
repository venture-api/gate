const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const morgan = require('morgan');
const Tasu = require('tasu');
const routers = require('./routers');
const errorHandler = require('./middleware/errorHandler');
const responseSender = require('./middleware/responseSender');
const logger = require('./logger');
const configLoader = require('yt-config');
const pack = require('./package.json');


const app = express();
app.set('logger', logger);

// ROUTERS AND GENERAL MIDDLEWARE

app.use(morgan(':date[iso] gateway INFO request :remote-addr :method :url :status :response-time ms'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(routers);
app.use(bearerToken());
app.use(errorHandler);
app.use(responseSender);

const server = http.createServer(app);


async function main()  {

    const config = await configLoader('config.ini');


    // TASU

    const tasu = new Tasu({group: 'gate'});
    await tasu.connected();
    app.set('tasu', tasu);


    // SERVER LAUNCH
    server.listen(config.port, () => {
        console.log(` `);
        console.log(`*********************************************************************`);
        console.log(` ⛖ ${pack.name}@${pack.version} listening on ${config.host}:${config.port} [${config.environment}]`);
        console.log(`*********************************************************************`);
        console.log(` `);
    });

}

main();
