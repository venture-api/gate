const express = require('express');
const raw = require('./raw');
const factory = require('./factory');
const status = require('./status');


const router = express.Router();

module.exports = () => {
    router.use('/raw', raw);
    router.use('/factories', factory);
    router.use('/status', status);
    return router;
};
