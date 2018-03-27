module.exports = (req, res) => {

    const logger = req.app.get('logger');
    if (!req.route) {
        res.status(404);
        res.body = {message: 'route not found'};
        return res.json(res.body).end();
    }
    if (!res.statusCode) res.status(200);
    if (!res.body) res.status(204);
    logger.debug(`request to route ${req.originalUrl} ended successfully:`, res.statusCode);
    logger.debug('sending response body:', res.body);
    res.json(res.body).end();
};
