module.exports = (error, req, res, next) => {

    const logger = req.app.get('logger');
    const {status, requestId, details, message} = error;

    res.status(status || 500);
    const body = {
        requestId,
        message,
        details
    };

    logger.error(res.statusCode, body.message);
    logger.error(error.stack);
    res.json(body).end();
};
