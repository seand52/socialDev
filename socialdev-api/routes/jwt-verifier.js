const { env: { JWT_SECRET } } = process

const jwt = require('jsonwebtoken')

function jwtVerifier(req, res, next) {
    try {
        const { token } = req

        const { sub } = jwt.verify(token, JWT_SECRET)

        req.sub = sub

        next()
    } catch ({ message }) {
        res.json({
            error: message
        })
    }
}

module.exports = jwtVerifier