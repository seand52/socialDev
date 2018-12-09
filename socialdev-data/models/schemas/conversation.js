const { Schema, SchemaTypes: { ObjectId } } = require('mongoose')
const Message = require('./message')

const Conversation = new Schema({
    members: [{
        type: ObjectId,
        ref: 'User',
        required: true
    }],

    created: {
        type: Date,
        default: Date.now,
        required: true
    },

    messages: [Message]
})

module.exports = Conversation