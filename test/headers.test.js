const request = require('request')
const assert = require('assert')

const app = require('./helpers/app')
const { securityHeaders, ContentSecurityPolicy } = require('../src')

const port = 1234
let server = null

beforeAll((done) => {
    app.use(securityHeaders())
    app.use('/csp', ContentSecurityPolicy({
        'default-src': ['\'self\''],
        'font-src': ['\'self\'', 'use.fontawesome.com', 'fonts.googleapis.com'],
        'style-src': ['\'self\'', 'https:', 'use.fontawesome.com', 'fonts.googleapis.com'],
        'base-uri': null,
        'frame-ancestors': null,
        'img-src': null,
        'object-src': null,
        'script-src': null,
        'script-src-attr': null,
    }))

    app.all('*', (req, res) => {
        res.end('OK')
    })

    server = app.listen(port, done)
})

afterAll((done) => {
    if (server && server.close) server.close(done)
})

test('Test security headers', (done) => {
    const inexpectedHeaders = ['x-powered-by']
    const expectedHeaders = [
        'x-content-type-options',
        'referrer-policy',
        'feature-policy',
        'x-xss-protection',
        'content-security-policy',
        'x-frame-option',
    ]

    request(`http://localhost:${port}/`, (err, response) => {
        expectedHeaders.forEach((headerName) => assert(headerName in response.headers))

        inexpectedHeaders.forEach((headerName) => assert(!(headerName in response.headers)))

        done()
    })
}, 50)

test('Test Content Security Policy', (done) => {
    const expectedDirectives = [
        'default-src \'self\'',
        'block-all-mixed-content',
        'font-src \'self\' use.fontawesome.com fonts.googleapis.com',
        'style-src \'self\' https: use.fontawesome.com fonts.googleapis.com',
        'upgrade-insecure-requests',
    ]

    request(`http://localhost:${port}/csp`, (err, response) => {
        const csp = response.headers['content-security-policy']
        const receivedDirectives = csp.split(';').map((d) => d.trim())

        assert.deepStrictEqual(receivedDirectives, expectedDirectives)

        done()
    })
}, 50)
