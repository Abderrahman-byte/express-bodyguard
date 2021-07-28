const express = require('express')

const app = express()

app.start = (port, cb) => app.listen(port || 1234, cb)

module.exports = app
