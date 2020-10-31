import URL from 'url';
import errors from 'http-errors';


const { MethodNotAllowed, NotFound } = errors;

/**
 * The router. Parses method and URL and performs a lookup for
 * appropriate route (endpoint) handler.
 *
 * @param {String} method - request's method (uppercase)
 * @param {String} url - request's URL
 * @return {{major:String, resourceId:String, minor:String, query:Object,...}}
 */
export default function (method, url) {

    const [ gate, logger ] = this;

    // routing
    const { pathname, query } = URL.parse(url, true);
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');
    const [ major, resourceId, minor ] = trimmedPath.split('/');
    const routePattern = '/' + [major, resourceId ? ':id' : undefined, minor].filter(p => p).join('/');
    const { routes } = gate.state;
    logger.debug('looking up route', { major, resourceId, minor }, 'in', Object.keys(routes).length, 'routes');

    // 404 pathname not found
    if (! routes[routePattern]) {
        throw new NotFound('Pathname not found');
    }

    // 405 method not found (thus not allowed)
    if (routes[routePattern] && ! routes[routePattern][method]) {
        throw new MethodNotAllowed('Not allowed: ' + method);
    }

    return { major, resourceId, minor, query, ...routes[routePattern][method] };
};
