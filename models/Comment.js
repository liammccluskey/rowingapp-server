const mongoose = require('mongoose')

const CommentSchema = mongoose.Schema({
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
        index: true,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    replies: {
        type: [
            {
                type: String,
                ref: 'Comment'
            }
        ],
        default: []
    }
}, {timestamps: true})

module.exports = mongoose.model('Comment', CommentSchema)