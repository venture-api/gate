const express = require('express');


const root = express.Router();


root.get('/status', (req, res, next) => {

    res.body = {status: 'ok'};
    next();

});