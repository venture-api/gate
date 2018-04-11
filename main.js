const Koa = require('koa');
const cors = require('@koa/cors');
const mount = require('koa-mount');
const raw = require('./routers/raw');

const core = new Koa();

core
    .use(cors({
        origin: 'http://localhost:3000',
        allowMethods: 'POST'
    }));


// ROUTERS

core.use(mount('/raw', raw));


core.listen(8000);
