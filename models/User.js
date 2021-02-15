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
    clubIDs: {
        type: [String],
        default: []
    }
}, {timestamps: true})

module.exports = mongoose.model('User', UserSchema)