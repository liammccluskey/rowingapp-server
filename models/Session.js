const mongoose = require('mongoose')
const SessionMember = require('./SessionMember')


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
        required: true
    },
    startAt: {
        type: Date,
        default: Date.now
    },
    members: {
        type: [ SessionMember.schema ],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
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


