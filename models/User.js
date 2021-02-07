const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    displayName: {
        type: String,
        required: true,
    },
    firebaseUID: {
        type: String,
        required: true,
    },
    clubIDs: {
        type: [String],
        default: []
    }
}, {timestamps: true})

module.exports = mongoose.model('User', UserSchema)