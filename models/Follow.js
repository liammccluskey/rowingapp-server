const mongoose = require('mongoose')

const FollowSchema = mongoose.Schema({
    follower: {
        type: String, 
        required: true,
        ref: 'User'
    },
    followee: {
        type: String,
        required: true,
        ref: 'User'
    }
})

FollowSchema.index({followee: 1, follower: 1}, {unique: true})

module.exports = mongoose.model('Follow', FollowSchema)