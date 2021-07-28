const headersMiddlewares = require('./headers')

module.exports = {
    securityHeaders: headersMiddlewares.default,
    ...headersMiddlewares
}

delete module.exports.default