const URL = require('url');
const ReqError = require('../../util/ReqError');

/**
 * The router. Parses method and URL and performs a lookup for
 * appropriate route (endpoint) handler.
 *
 * @param {string} method - request's method (uppercase)
 * @param {string} url - request's URL
 * @return {{major:string, resourceId:string, minor:string, ...}}
 */
module.exports = function (method, url) {

    const {kojo, logger} = this;

    // routing
    const {pathname} = URL.parse(url, true);
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');
    logger.debug('looking up route');
    const [major, resourceId, minor] = trimmedPath.split('/');
    const routePattern = '/' + [major, resourceId ? ':id' : undefined, minor].filter(p => p).join('/');
    const routes = kojo.get('routes');

    // 404 pathname not found
    if (!routes[routePattern]) {
        throw new ReqError(404);
    }

    // 405 method not found (thus not allowed)
    if (routes[routePattern] && !routes[routePattern][method]) {
        throw new ReqError(405);
    }

    return {major, resourceId, minor,...routes[routePattern][method]};
};
