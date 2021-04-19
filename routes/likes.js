const express = require('express')
const router = express.Router()
const Like = require('../models/Like')

// PATH: /comments

// GET: get likes info on a post
router.get('/parent/:parentID', async (req, res) => {
    try {

        const count = await Like.countDocuments({parent: req.params.parentID})
        const countSelf = await Like.countDocuments({parent: req.params.parentID, user: req.query.user})
        res.json({
            count: count,
            didLike: countSelf > 0
        })
    } catch (error) {
        res.status(500).json({message: error})
    }   
})

// POST: like a post 
router.post('/', async (req, res) => {
    const like = new Like({
        user: req.body.user,
        parent: req.body.parent
    })
    try {
        await like.save()
        res.json({message: 'Like saved'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// DELETE: unlike a post
router.delete('/', async (req, res) => {
    try {
        await Like.deleteOne({_id: req.query.like, user: req.query.user})
        res.json({message: 'Comment deleted'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

module.exports = router