const headersMiddlewares = require('./headers')
const rateLimitMiddleware = require('./rate-limit')

module.exports = {
    securityHeaders: headersMiddlewares.default,
    rateLimit: rateLimitMiddleware,
    ...headersMiddlewares,
}

delete module.exports.default
