module.exports = (error, req, res, next) => {

    const logger = req.app.get('logger');
    const body = {};


    // STRING ERROR

    if (typeof error === 'string') body.message = error;


    // OBJECT ERROR

    if (error.status) {
        res.status(error.status);
    }


    // NORMAL ERROR

    if (error instanceof Error) {
        if (error.requestId)
            body.requestId = error.requestId;
        body.message = error.message;
    }

    if (!res.statusCode || res.statusCode < 400) res.status(500);
    logger.error(res.statusCode, body.message);
    delete error.stack;
    res.json(body).end();
};
