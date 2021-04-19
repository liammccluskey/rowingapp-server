const express = require('express')
const router = express.Router()
const Comment = require('../models/Comment')

// PATH: /comments

// GET: get all comments on a post
router.get('/parent/:parentID', async (req, res) => {
    try {
        const comments = await Comment.find({parent: req.params.parentID})
        .lean()
        .sort('-createdAt')
        .populate('user', 'displayName iconURL')

        res.json(comments)
    } catch (error) {
        res.status(500).json({message: error})
    }   
})

// POST: comment on a post
router.post('/', async (req, res) => {
    const comment = new Comment({
        user: req.body.user,
        parent: req.body.parent,
        body: req.body.message
    })
    try {
        const comment = await comment.save()
        res.json({message: 'Comment saved'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// DELETE: delete a comment
router.delete('/', async (req, res) => {
    try {
        await Comment.deleteOne({_id: req.query.comment, user: req.query.user})
        res.json({message: 'Comment deleted'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

module.exports = router