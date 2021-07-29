const crypto = require('crypto')
const jwt = require('jsonwebtoken')

class Token {
    static DATA_LENGTH = 50

    static getRandomData(len = 50) {
        return crypto.randomBytes(Math.max(len / 2, 1)).toString('hex')
    }

    static generate(key, expiresIn = 3000) {
        return jwt.sign({ token: this.getRandomData(this.DATA_LENGTH) }, key, { expiresIn })
    }

    static verify(token, key) {
        try {
            jwt.verify(token, key)
            return true
        } catch {
            return false
        }
    }
}

module.exports = Token
