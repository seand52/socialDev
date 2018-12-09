const { Schema, SchemaTypes: { ObjectId } } = require('mongoose')

const Message = new Schema({
    sender: {
        type: ObjectId,
        ref: 'User',
        required: true
    },

    text: {
        type: String,
        required: true
    },

    sent: {
        type: Date,
        default: Date.now,
        required: true
    },
    
    status: {
        type: String,
        default: 'pending',
        enum: ['read', 'pending'],
        required: true
    }

})

module.exports = Message