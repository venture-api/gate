module.exports = (error, req, res, next) => {

    const logger = req.app.get('logger');
    const body = {};

    res.status(error.status || 500);

    if (error.requestId)
        body.requestId = error.requestId;
    body.message = error.message;

    logger.error(res.statusCode, body.message);
    logger.error(error.stack);
    res.json(body).end();
};
