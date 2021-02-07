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
}, {timestamps: {createdAt: 'created_at'})

module.exports = mongoose.model('User', UserSchema)