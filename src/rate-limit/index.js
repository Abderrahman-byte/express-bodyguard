const crypto = require('crypto')
const MemoryStore = require('./MemoryStore')

const DEFAULT_OPTIONS = {
    hash_method: 'sha1',
    statusCode: 429,
    message: 'Too mush request',
    requestPerSecond: 30,
}

const RateLimit = (options_) => {
    const options = Object.assign(DEFAULT_OPTIONS, options_)

    const store = options.store || new MemoryStore()

    const hash = (data) => crypto.createHash(options.hash_method).update(data).digest('base64')

    return (request, response, next) => {
        const { ip } = request
        const userAgent = request.headers['user-agent'] || ''
        const acceptField = request.headers.accept || ''
        const acceptEncoding = request.headers['accept-encoding'] || ''
        const acceptLanguage = request.headers['accept-language'] || ''
        const key = hash(ip + userAgent + acceptField + acceptEncoding + acceptLanguage)

        store.incr(key, (err, hits) => {
            if (hits >= options.requestPerSecond) {
                const error = new Error(options.message)
                error.statusCode = options.statusCode
                return next(error)
            }

            setTimeout(() => store.decrement(key), 1000)
            next()
        })
    }
}

module.exports = RateLimit
