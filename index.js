/**
 * @module inflight-requests
 * @author gui.hermeto@gmail.com
 * @licence MIT
 */

const { onceAny } = require('events-decorator');

/**
 * @typedef {Object} Counter
 * @property {number} inflightRequests
 */

/**
 * @type {Counter}
 */
const defaultCounter = { inflightRequests: 0 };

/**
 * @param {Counter} [context]
 * @return {Middleware}
 */
const inflightRequestsCounter = (context = defaultCounter) => {
    context.inflightRequests = 0;

    /**
     * @method
     * @typedef {Function} Middleware
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     * @param {function(): void} next
     */
    function middleware(req, res, next) {
        context.inflightRequests++;
        onceAny(res, ['error', 'finish', 'close'], () => context.inflightRequests--);
        next();
    }

    /**
     * returns the count of in-flight requests
     * @method
     * @return {number}
     */
    middleware.requestsCount = function () {
        return context.inflightRequests;
    };

    return middleware;
};

module.exports = inflightRequestsCounter;
