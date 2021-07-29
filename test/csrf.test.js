const request = require('request')
const assert = require('assert')
const cookie = require('cookie')

const app = require('./helpers/app')
const { csrfProtection } = require('../src')
const Token = require('../src/csrf/token')

const port = 1235
const secret = Token.getRandomData(10)
const expiresIn = 2
const statusCode = 400
let server = null

const getCsrf = () => new Promise((resolve, reject) => {
    request(`http://localhost:${port}/`, (err, response) => {
        if (err) reject(err)
        if (response.statusCode !== 200) reject(response.statusCode)

        const setCookieHeaders = response.headers['set-cookie']
        const csrfTokenCookie = setCookieHeaders.find((h) => h.startsWith('csrfToken='))

        resolve(csrfTokenCookie)
    })
})

const sendPostWithCsrf = (csrfCookie) => {
    const { csrfToken } = cookie.parse(csrfCookie)
    const jar = request.jar()
    jar.setCookie(csrfCookie, `http://localhost:${port}/`)

    return new Promise((resolve, reject) => {
        request({
            url: `http://localhost:${port}/`,
            method: 'POST',
            headers: { 'x-csrf-token': csrfToken },
            jar,
        }, (err, response) => {
            if (err) reject(err)
            resolve(response.statusCode)
        })
    })
}

const callbackAfterTimeout = (cb, timeout) => new Promise((resolve, reject) => {
    setTimeout(() => {
        cb().then(resolve).catch(reject)
    }, timeout)
})

const sendProperCsrf = async () => {
    const csrf = await getCsrf()
    const status = await sendPostWithCsrf(csrf)
    return status
}

const sendExpiredCsrf = async (timeout) => {
    const csrf = await getCsrf()
    const status = await callbackAfterTimeout(() => sendPostWithCsrf(csrf), timeout)
    return status
}

beforeAll((done) => {
    app.use(csrfProtection({ expiresIn, secret, statusCode }))

    app.all('/', (req, res) => res.end('Ok'))

    app.use((err, req, res, next) => {
        res.status(err.statusCode || 400).end(err.message)
        if (next instanceof Function) next()
    })

    server = app.listen(port, done)
})

afterAll((done) => {
    if (server?.close) server.close(done)
})

test('Should Respond With 200 Without CSRFToken On Safe Method', (done) => {
    request(`http://localhost:${port}/`, (err, response, body) => {
        assert(!err)
        assert.strictEqual(response.statusCode, 200, `Got Body : '${body}'`)
        done()
    })
})

test('Sould Respond With Error On Unsafe Method Witout Giving Token', (done) => {
    request(
        {
            url: `http://localhost:${port}/`,
            method: 'POST',
            form: { author: 'Abderrahmane' },
        },
        (err, response) => {
            assert(!err, `ERROR : ${err}`)
            assert.strictEqual(response.statusCode, statusCode)
            done()
        },
    )
})

test('Sould Respond With 200 Given The Token', async () => expect(sendProperCsrf()).resolves.toBe(200))

test('Sould Respond With 200 Given Token Before expired', async () => expect(sendExpiredCsrf(1000)).resolves.toBe(200))

test('Sould Respond With 200 Given Token Before expired', async () => expect(sendExpiredCsrf(expiresIn * 1000)).resolves.toBe(statusCode))
