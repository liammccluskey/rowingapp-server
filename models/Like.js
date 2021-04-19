const mongoose = require('mongoose')

const LikeSchema = mongoose.Schema({
    user: {
        type: String,
        required: true,
        ref: 'User'
    },
    // parent (ID) can be anything that is commentable
    // - activity, session
    // - consider adding comments on comments (tricky though)
    parent: {   
        type: String,
        required: true
    }
})

LikeSchema.index({user: 1, parent: 1}, {unique: true})

module.exports = mongoose.model('Like', LikeSchema)