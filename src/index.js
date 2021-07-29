const headersMiddlewares = require('./headers')
const rateLimitMiddleware = require('./rate-limit')
const csrfProtectionMiddleware = require('./csrf')

module.exports = {
    securityHeaders: headersMiddlewares.default,
    rateLimit: rateLimitMiddleware,
    csrfProtection: csrfProtectionMiddleware,
    ...headersMiddlewares,
}

delete module.exports.default
