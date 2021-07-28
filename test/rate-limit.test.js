const request = require('request')
const assert = require('assert')

const { rateLimit } = require('../src')
const app = require('./helpers/app')

let server = null
const requestPerSecond = 50

beforeAll((done) => {
    app.use(rateLimit({ requestPerSecond }))

    app.get('*', (req, res) => res.end('Ok'))

    app.use((err, req, res, next) => {
        res.status(err.statusCode || 400).end(err.message)
        if (next instanceof Function) next()
    })

    server = app.start(1236, done)
})

afterAll((done) => {
    if (server && server.close) server.close()
    done()
})

test('Test Rate Limit', (done) => {
    request('http://127.0.0.1:1236/', (err, response) => {
        assert.strictEqual(response.statusCode, 200)
    })

    for (let i = 0; i < requestPerSecond - 2; i += 1) request('http://127.0.0.1:1236/')

    request('http://127.0.0.1:1236/', (err, response, body) => {
        assert.strictEqual(response.statusCode, 429)
        assert.strictEqual(body.toLowerCase(), 'too mush request')
    })

    setTimeout(() => {
        request('http://127.0.0.1:1236/', (err, response) => {
            assert.strictEqual(response.statusCode, 200)
            done()
        })
    }, 2000)
}, 3000)
