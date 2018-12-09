const { AlreadyExistsError, AuthError, NotFoundError, ValueError } = require('../errors')

function routeHandler(callback, res) {
    try {

        callback()
            .catch(err => {
                const { message } = err

                if (err instanceof AuthError) {
                    res.status(401)
                } else if (err instanceof AlreadyExistsError) {
                    res.status(409)
                } else if (err instanceof NotFoundError) {
                    res.status(404)
                } else {
                    res.status(500)
                }

                res.json({
                    error: message
                })
            })
    } catch (err) {
        const { error: message } = err

        if (err instanceof TypeError || err instanceof ValueError) {
            res.status(400)
        } else {
            res.status(500)
        }

        res.json({
            error: message
        })
    }
}

module.exports = routeHandler