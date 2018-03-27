const express = require('express');
const rootRouter = require('./root');
const rawRouter = require('./raw');


const router = express.Router();

module.exports = () => {
    router.use('/raw', rawRouter);
    router.use('/', rootRouter);
    return router;
};
