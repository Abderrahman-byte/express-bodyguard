const Store = require('./Store')

const DEFAULT_OPTIONS = {}

class MemoryStore extends Store {
    constructor(options) {
        super()
        this.hits = {}
        this.options = Object.assign(DEFAULT_OPTIONS, options)
    }

    incr(key, cb) {
        this.hits[key] = (this.hits[key] || 0) + 1
        cb(null, this.hits[key], null)
    }

    decrement(key) {
        if (this.hits[key]) this.hits[key] -= 1
    }

    resetKey(key) {
        delete this.hits[key]
    }
}

// const ms = new MemoryStore()

module.exports = MemoryStore
