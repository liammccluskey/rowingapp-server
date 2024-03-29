const mongoose = require('mongoose')

/*
    Memberhsip Roles
    - -1: req to join pending
    - 0 : member
    - 1 : admin
    - 2 : owner
*/

const ClubMembershipSchema = mongoose.Schema({
    club: {
        type: String,
        ref: 'Club',
        required: true
    },
    user: {
        type: String,
        ref: 'User',
        required: true
    },
    role: {
        type: Number,
        required: true
    }
})

ClubMembershipSchema.index({club: 1, user: 1}, {unique: true})

module.exports = mongoose.model('ClubMembership', ClubMembershipSchema)