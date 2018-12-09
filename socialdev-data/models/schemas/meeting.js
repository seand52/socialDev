const { Schema, SchemaTypes: { ObjectId } } = require('mongoose')

const Meeting = new Schema({
    project: {
        type: ObjectId,
        ref: 'Project',
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    attending: [{
        type: ObjectId,
        ref: 'User'
    }],

    description: {
        type: String,
    }
})

module.exports = Meeting