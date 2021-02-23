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
    },
    isReady: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('Activitie', ActivitySchema)