const mongoose = require('mongoose')
const User = require('./models/schemas/user')
const Project = require('./models/schemas/project')
const Meeting = require('./models/schemas/meeting')
const Message = require('./models/schemas/message')
const Conversation = require('./models/schemas/conversation')
module.exports = {
    mongoose,
    models: {
        User: mongoose.model('User', User),
        Project: mongoose.model('Project', Project),
        Meeting: mongoose.model('Event', Meeting),
        Conversation: mongoose.model('Conversation', Conversation)
    }
}