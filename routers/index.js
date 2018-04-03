const express = require('express');
const raw = require('./raw');
const factory = require('./factory');


const router = express.Router();

module.exports = () => {
    router.use('/raw', raw);
    router.use('/factories', factory);
    return router;
};
