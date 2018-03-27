module.exports = (error, req, res, next) => {

    const logger = req.app.get('logger');
    logger.error(error);


    // STRING ERROR

    if (typeof error === 'string') error = {message: error};


    // OBJECT ERROR

    if (error.status) {
        res.status(error.status);
        delete error.status;
    }


    // NORMAL ERROR

    if (error instanceof Error) {
        error = {message: error.message}
    }

    if (!res.statusCode || res.statusCode < 400) res.status(500);
    logger.debug('request ended with error', res.statusCode);
    delete error.stack;
    res.json({error}).end();
};
