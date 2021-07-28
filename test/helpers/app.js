const express = require('express')

const app = express()

app.start = (cb) => app.listen(1234, cb)

module.exports = app
