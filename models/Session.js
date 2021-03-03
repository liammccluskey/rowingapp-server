const mongoose = require('mongoose')

const SessionSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    hostName: {
        type: String,
        required: true
    },
    hostUID: {
        type: String,
        required: true,
        index: true
    },
    startAt: {
        type: Date,
        required: true
    },
    isAccessibleByLink: {
        type: Boolean,
        required: true
    },
    associatedClubID: {
        type: String,
        required: true,
        index: true
    },
    workoutItems: {   // Text description of each workout item (ex. : 2k 2 warmup, 10k SS, etc.)
        type: [String],
        required: true
    },
    memberUIDs: {
        type: [String],
        default: []
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Session', SessionSchema)


