const ContentSecurityPolicy = require('./ContentSecurityPolicy')
const XFrameOption = require('./XFrameOption')

const DEFAULT_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Feature-Policy': 'microphone \'none\'; camera \'none\'',
    'X-XSS-Protection': '1; mode=block',
}

const DEFAULT_OPTIONS = {
    CSPDirectives: {},
    XFrameOption: false,
    XFrameAllow: [],
}

const setSecurityHeaders = ({
    CSPDirectives = {},
    XFrameSamesite = false,
    XFrameAllow = [],
} = DEFAULT_OPTIONS) => {
    const CSPMiddleware = ContentSecurityPolicy(CSPDirectives)
    const XFrameOptionMiddleware = XFrameOption(XFrameSamesite, XFrameAllow)

    return (request, response, next) => {
        response.removeHeader('X-Powered-By')

        Object.entries(DEFAULT_HEADERS)
            .forEach((header) => response.setHeader(header[0], header[1]))

        CSPMiddleware(request, response, null)
        XFrameOptionMiddleware(request, response, null)
        next()
    }
}

module.exports = {
    setSecurityHeaders,
    ContentSecurityPolicy,
    XFrameOption,
    default: setSecurityHeaders,
}

exports.default = setSecurityHeaders
