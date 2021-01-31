const mongoose = require('mongoose')

const SessionMemberSchema = mongoose.Schema({
    name: String,
    isReady: {
        type: Boolean,
        default: false
    },
    currentPace:{
        type: Number,
        default: 0
    },    
    averagePace: {
        type: Number,
        default: 0
    },
    totalDistance: {
        type: Number,
        default: 0
    }, 
    currentStrokeRate: {
        type: Number,
        default: 0
    },
    averageStrokeRate: {
        type: Number,
        default: 0
    },
    totalTime: {
        type: Number,   // seconds
        default: 0, 
    }

})

module.exports = mongoose.model('SessionMember', SessionMemberSchema)