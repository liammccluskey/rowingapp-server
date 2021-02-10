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
    description: {
        type: String,
        required: true,
    }
}, {timestamps: true} )

module.exports = mongoose.model('Club', ClubSchema)