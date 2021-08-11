const { parse: parseCookies } = require('cookie')
const Token = require('./token')

const DEFAULT_OPTIONS = {
    secret: null,
    key: 'csrfToken',
    saveMethods: ['HEAD', 'OPTIONS', 'GET'],
    statusCode: 403,
    message: 'Invalid CSRF Token',
    expiresIn: 3600, // One Hour,
    perPage: false, // Not recommended
}

const getCsrfFromRequest = (request) => (request.body && request.body._csrf)
    || (request.query && request.query._csrf)
    || (request.headers['csrf-token'])
    || (request.headers['xsrf-token'])
    || (request.headers['x-csrf-token'])
    || (request.headers['x-xsrf-token'])

const createError = (status, message) => {
    const error = new Error(message)
    error.statusCode = status
    return error
}

const renewCsrfToken = (request, response, secret, options) => {
    const { expiresIn } = options
    const { key } = options
    const newToken = Token.generate(secret, expiresIn)
    request._csrf = newToken
    response.cookie(key, newToken, { expires: new Date(Date.now() + expiresIn * 1000) })
    return newToken
}

const csrfProtection = (options) => {
    const options_ = { ...DEFAULT_OPTIONS, ...options }
    const { secret } = options_
    const { key } = options_
    const saveMethods = options_.saveMethods.map((m) => m.toLowerCase())

    if (!secret || typeof secret !== 'string' || secret === '') throw new Error('Secret must be provided')

    return (request, response, next) => {
        const isSafe = saveMethods.includes(request.method.toLowerCase())
        const cookies = request.cookies || parseCookies(request.headers.cookie || '')
        const csrfTokenCookie = cookies[key]
        const recievedCsrf = getCsrfFromRequest(request)

        const cookieVerified = Token.verify(csrfTokenCookie, secret)
        const verified = csrfTokenCookie === recievedCsrf && cookieVerified

        // Verify Incoming request
        if (!isSafe && (!csrfTokenCookie || !verified)) {
            return next(createError(options_.statusCode, options_.message))
        }

        // set method to get new token
        request.csrfToken = () => renewCsrfToken(request, response, secret, options_)

        // renew Token if request method is but token has expired
        if (!csrfTokenCookie || !cookieVerified) request.csrfToken()
        else request._csrf = csrfTokenCookie

        next()
    }
}

module.exports = csrfProtection
