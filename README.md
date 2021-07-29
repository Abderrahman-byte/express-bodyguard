# Express Security

Express security is a library of middleware that helps enhance web application security.

## Features :

- [x] Http security headers
- [x] Brute Forcing Protection
- [x] CSRF Protection

## Middlewares :

### expressSecurity.securityHeaders :

```javascript
const { securityHeaders } = require('express-security')
app.use(securityHeaders())
```

### expressSecurity.rateLimit :

```javascript
const { rateLimit } = require('express-security')
app.use(rateLimit())
```

using [rate-limit-redis](https://github.com/wyattjoh/rate-limit-redis) as store :

```shell
npm install rate-limit-redis
```

```javascript

const RedisStore = require('rate-limit-redis')
const { rateLimit } = require('express-security')

app.use(rateLimit({
    store : new RedisStore({
        redisURL: '<redis-url>',
    })
}))
```

### expressSecurity.csrfProtection :
```javascript
const { csrfProtection } = require('express-security')

app.use(csrfProtection({
    secret: '<secret-sign-key>',
    key: 'csrfToken',
    saveMethods: ['HEAD', 'OPTIONS', 'GET'],
    statusCode: 403,
    message: 'Invalid CSRF Token',
    expiresIn: 3600,
}))
```

## Contribute

```
git clone https://github.com/Abderrahman-byte/express-security
cd express-security
npm install
```

To lint and test:

```
npm test
```

## License

[MIT](LICENSE)