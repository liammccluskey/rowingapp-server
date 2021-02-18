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
    memberUIDs: {
        type: [String],
        default: []
    },
    activityIDs: {
        type: [String],
        default: []
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
})


// Virtuals
SessionSchema.virtual('numMembers').get(function() {
    return this.members.length
})
SessionSchema.virtual('numMembersReady').get(function() {
    return this.members.filter(member => member.isReady).length
})

module.exports = mongoose.model('Session', SessionSchema)


