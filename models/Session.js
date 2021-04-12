const mongoose = require('mongoose')

const SessionSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    hostUser: {
        type: String,
        required: true,
        index: true,
        ref: 'User'
    },
    club: {
        type: String,
        index: true,
        ref: 'Club'
    },
    members: [{
        type: String,
        ref: 'User'
    }],
    startAt: {
        type: Date,
        required: true
    },
    workoutItems: {   // Text description of each workout item (ex. : 2k 2 warmup, 10k SS, etc.)
        type: [String],
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Session', SessionSchema)


