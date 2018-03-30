const express = require('express');
const rawRouter = require('./raw');


const router = express.Router();

module.exports = () => {
    router.use('/raw', rawRouter);
    return router;
};
