function bearerTokenParser(req, res, next) {
    try {
        const { headers: { authorization } } = req

        const token = authorization.split(' ')[1]

        req.token = token

        next()
    } catch (err) {
        next()
    }
}

module.exports = bearerTokenParser