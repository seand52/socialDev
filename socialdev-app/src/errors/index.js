const AlreadyExistsError = require('./already-exists-error')
const AuthError = require('./auth-error')
const NotAllowedError = require('./not-allowed-error')
const NotFoundError = require('./not-found-error')
const ValueError = require('./value-error')

module.exports = {
    AlreadyExistsError,
    AuthError,
    NotAllowedError,
    NotFoundError,
    ValueError
}