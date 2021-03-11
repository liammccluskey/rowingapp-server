const mongoose = require('mongoose')

const ActivitySchema = mongoose.Schema({
    uid: {
        type: String,
        required: true,
        index: true
    },
    name: { // user's name
        type: String,
        required: true
    },
    workoutItemIndex: {
        type: Number,
        required: true
    },
    sessionID: {
        type: String,
        requried: true,
        index: true
    },
    currentPace:{
        type: Number,
        default: 0
    },    
    averagePace: {
        type: Number,
        default: 0
    },
    distance: {
        type: Number,
        default: 0
    }, 
    strokeRate: {   // current stroke rate ?
        type: Number,
        default: 0
    },
    avgStrokeRate: { // average stroke rate
        type: Number,
        default: 0
    },
    elapsedTime: {
        type: Number,   // seconds
        default: 0, 
    },
    workoutType: {
        type: Number,
        default: -1 // invalid type default
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('Activitie', ActivitySchema)