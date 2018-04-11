const Koa = require('koa');
const _ = require('koa-route');


const raw = new Koa();

// COAL

raw.use(_.get('/coal', (ctx) => {
    ctx.body = {type: 'raw.coal', id: '615dc7c8-ab26-42c1-a2b4-b3459411cc75'};
}));


// ORES

raw.use(_.get('/ores/iron', (ctx, next) => {
    ctx.body = {token: 'ISAAXTKN'};
    next();
}));

module.exports = raw;
