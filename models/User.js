const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    displayName: {
        type: String,
        required: true,
    },
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    iconURL: {
        type: String,
        required: false,
        default: null
    },
    bannerURL: {
        type: String,
        required: false,
        default: null
    },
    colorTheme: {
        /*
            - 0 : light mode
            - 1 : dark mode
        */
        type: Number,
        default: 0  
    },
    tintColor: {
        /*
            0 - 3 (diff colors)
        */
       type: Number,
       default: 0
    }
}, {timestamps: true})

// Make this compound when user model is more filled out ?
UserSchema.index({displayName: 'text'}, {weights: {displayName: 1}})

module.exports = mongoose.model('User', UserSchema)