/**
 * Registers a route handler
 *
 * @param {Object} config - route config
 * @param {String} config.method
 * @param {String} config.pathname
 * @param {Function} handler - the handler function
 * @return {undefined}
 */
module.exports = function (config, handler) {

    const {kojo} = this;
    const {method, pathname} = config;
    const routes = kojo.get('routes');

    if (!routes[pathname]) routes[pathname] = {};

    routes[pathname][method] = handler;
};
