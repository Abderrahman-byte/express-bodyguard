const request = require('request')
const assert = require('assert')

const { rateLimit } = require('../src')
const app = require('./helpers/app')

const port = 1236
let server = null
const requestPerSecond = 50

beforeAll((done) => {
    app.use('/', rateLimit({ requestPerSecond }))
    app.use('/2', rateLimit({ requestPerSecond }))

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

test('Test Rate Limit', (done) => {
    request(`http://localhost:${port}/`, (err, response) => {
        assert.strictEqual(response.statusCode, 200)
    })

    for (let i = 0; i < requestPerSecond - 2; i += 1) request(`http://localhost:${port}/`)

    request(`http://localhost:${port}/`, (err, response, body) => {
        assert.strictEqual(response.statusCode, 429)
        assert.strictEqual(body.toLowerCase(), 'too mush request')
    })

    setTimeout(() => {
        request(`http://localhost:${port}/`, (err, response) => {
            assert.strictEqual(response.statusCode, 200)
            done()
        })
    }, 2000)
}, 2100)

test('Test Rate Limit Continously', (done) => {
    const requestCount = 100

    for (let i = 1; i <= requestCount; i += 1) {
        request(`http://localhost:${port}/2`, (err, response, body) => {
            if (i < requestPerSecond - 2) {
                assert.strictEqual(response.statusCode, 200, `Error request ${i}`)
            } else {
                assert.strictEqual(response.statusCode, 429, `Error request ${i}`)
                assert.strictEqual(body.toLowerCase(), 'too mush request', `Error request ${i}`)
            }

            if (i === requestCount - 1) done()
        })
    }
}, 200)
