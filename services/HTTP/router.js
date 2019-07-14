const URL = require('url');
const ReqError = require('../../util/ReqError');

/**
 * The router. Parses method and URL and performs a lookup for
 * appropriate route (endpoint) handler.
 *
 * @param {String} method - request's method (uppercase)
 * @param {String} url - request's URL
 * @return {{major:String, resourceId:String, minor:String, query:Object,...}}
 */
module.exports = function (method, url) {

    const [ gate, logger ] = this;

    // routing
    const {pathname, query} = URL.parse(url, true);
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');
    const [ major, resourceId, minor ] = trimmedPath.split('/');
    logger.debug('looking up route', { major, resourceId, minor });
    const routePattern = '/' + [major, resourceId ? ':id' : undefined, minor].filter(p => p).join('/');
    const { routes } = gate.state;

    // 404 pathname not found
    if (!routes[routePattern]) {
        throw new ReqError(404, 'pathname not found');
    }

    // 405 method not found (thus not allowed)
    if (routes[routePattern] && !routes[routePattern][method]) {
        throw new ReqError(405, 'method not allowed');
    }

    return {major, resourceId, minor, query, ...routes[routePattern][method]};
};
