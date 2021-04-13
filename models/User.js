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
    usesDarkMode: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('User', UserSchema)