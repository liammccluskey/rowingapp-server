const mongoose = require('mongoose')

const ClubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    customURL: { // app.com/clubs/customURL
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    iconURL: {
        type: String,
        required: true
    },
    bannerURL: {
        type: String,
        required: false,
        default: undefined
    }
}, {timestamps: true} )

ClubSchema.index(
    {
        name: 'text',
        description: 'text'
    },
    {
        weights: {
            name: 10,
        }
    }
)

module.exports = mongoose.model('Club', ClubSchema)