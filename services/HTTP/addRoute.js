/**
 * Registers a route handler
 *
 * @param {Object} config - route config
 * @param {String} config.method - route method
 * @param {String} config.pathname - route pathname
 * @param {String} config.access - route access record ([principal, action, resource])
 * @param {Function} handler - the handler function
 * @return {undefined}
 */
module.exports = function (config, handler) {

    const [ gate ] = this;
    const { method, pathname, access } = config;
    const { routes } = gate.state;

    if (!routes[pathname])
        routes[pathname] = {};

    routes[pathname][method] = {handler, access};
};
