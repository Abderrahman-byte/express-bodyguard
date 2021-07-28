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

#### expressSecurity.securityHeaders :

```javascript
const { rateLimit } = require('express-security')
app.use(rateLimit())
```