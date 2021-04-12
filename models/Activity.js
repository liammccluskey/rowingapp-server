const mongoose = require('mongoose')

const ActivitySchema = mongoose.Schema({
    user: {
        type: String,
        required: true,
        index: true,
        ref: 'User'
    },
    workoutItemIndex: {
        type: Number,
        required: true
    },
    session: {
        type: String,
        requried: true,
        index: true,
        ref: 'Session'
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
    totalCalories: {
        type: Number,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('Activitie', ActivitySchema)