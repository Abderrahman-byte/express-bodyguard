# Express Security

Express security is a library of middleware that helps enhance web application security.

### Features :

- [x] Http security headers
- [x] Brute Forcing Protection
- [ ] CSRF Protection

### Middleware :

#### expressSecurity.securityHeaders :

```javascript
const { securityHeaders } = require('express-security')
app.use(securityHeaders())
```

#### expressSecurity.rateLimit :

```javascript
const { rateLimit } = require('express-security')
app.use(rateLimit())
```

using [rate-limit-redis](https://github.com/wyattjoh/rate-limit-redis) :

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