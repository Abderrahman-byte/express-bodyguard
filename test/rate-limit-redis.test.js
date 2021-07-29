const assert = require('assert')
const path = require('path')
const fs = require('fs')
const RedisStore = require('rate-limit-redis')
const request = require('request')

const { rateLimit } = require('../src')
const app = require('./helpers/app')

const port = 1237
let server = null
const requestPerSecond = 50

beforeAll((done) => {
    const rateLimitStore = new RedisStore({
        expiry: 60,
        redisURL: fs.readFileSync(path.resolve(__dirname, './.redis.env')).toString().trim(),
        prefix: `${(Math.random() * 100).toString()}:`,
    })

    app.use('/', rateLimit({
        requestPerSecond,
        store: rateLimitStore,
    }))

    app.get('*', (req, res) => res.end('Ok'))

    app.use((err, req, res, next) => {
        res.status(err.statusCode || 400).end(err.message)
        if (next instanceof Function) next()
    })

    server = app.listen(port, done)
})

afterAll((done) => {
    if (server && server.close) server.close(done)
})

test('Test Rate Limit Continously', (done) => {
    const requestCount = 100

    for (let i = 1; i <= requestCount; i += 1) {
        request({
            url: `http://localhost:${port}/`,
            headers: { 'user-agent': 'TEST' },
        }, (err, response, body) => {
            if (i < requestPerSecond) {
                assert.strictEqual(response.statusCode, 200, `Error request ${i}`)
            } else {
                assert.strictEqual(response.statusCode, 429, `Error request ${i}`)
                assert.strictEqual(body.toLowerCase(), 'too mush request', `Error request ${i}`)
            }

            if (i === requestCount - 1) done()
        })
    }
})
