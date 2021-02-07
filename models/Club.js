const mongoose = require('mongoose')

const ClubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    adminUIDs: {
        type: [String],
        required: true,
    },
    memberUIDs: {
        type: [String],
        required: true
    },
    customURL: { // app.com/clubs/customURL
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: {createdAt: 'created_at'}} )

module.exports = mongoose.model('Club', ClubSchema)