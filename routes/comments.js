const express = require('express')
const { populate } = require('../models/Comment')
const router = express.Router()
const Comment = require('../models/Comment')

// PATH: /comments

// GET: get all comments on a post
router.get('/parent/:parentID', async (req, res) => {
    console.log('did hit route')
    try {
        const comments = await Comment.find({parent: req.params.parentID})
        .lean()
        .sort('createdAt')
        .populate('user', 'displayName iconURL')
        .populate({
            path: 'replies',
            options: { sort: { createdAt: 1} },
            populate: {
                path: 'user',
                select: 'displayName iconURL'
            }
        })

        res.json(comments)
    } catch (error) {
        res.status(500).json({message: error})
    }   
})

// POST: reply to a comment
router.post('/reply', async (req, res) => {
    const reply = new Comment({
        user: req.body.user,
        parent: req.body.parent,
        message: req.body.message
    })
    try {
        await reply.save()
        await Comment.findOneAndUpdate(
            {_id: req.body.parent},
            {$addToSet: {replies: reply._id}}
        )
        res.json({message: 'Reply saved'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// DELETE: delete a reply to a comment
router.delete('/reply', async (req, res) => {
    try {
        await Comment.findOneAndDelete({_id: req.query.reply, user: req.query.user})
        await Comment.findOneAndUpdate(
            {_id: req.query.parent},
            {$pull: {replies: req.query.reply}}
        )
        res.json({message: 'Reply deleted'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// POST: comment on a post
router.post('/', async (req, res) => {
    const comment = new Comment({
        user: req.body.user,
        parent: req.body.parent,
        message: req.body.message
    })
    try {
        await comment.save()
        res.json({message: 'Comment saved'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// DELETE: delete a comment
router.delete('/', async (req, res) => {
    try {
        const comment = await Comment.findOne({_id: req.query.comment, user: req.query.user})
        if (comment.replies.length > 0) {
            comment.removed = true
            await comment.save()
        } else {
            await Comment.deleteOne({_id: req.query.comment, user: req.query.user})
        }
        
        res.json({message: 'Comment deleted'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

module.exports = router