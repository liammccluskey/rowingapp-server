const express = require('express')
const router = express.Router()
const Follow = require('../models/Follow')
const User = require('../models/User')

// PATH: /follows

// GET: a user's follow count info (follwing, followers)
router.get('/user/:userID/summary', async (req, res) => {
    async function fetchFollowersCount() {
        try {
            return await Follow.countDocuments({followee: req.params.userID})
        } catch (error) { return 0 }
    }
    async function fetchFollowingCount() {
        try {
            return await Follow.countDocuments({follower: req.params.userID})
        } catch (error) { return 0 }
    }
    res.json({
        followers: await fetchFollowersCount(),
        followees: await fetchFollowingCount()
    })
})

// GET: a user's followers
router.get('/user/:userID/followers', async (req, res) => {
    try {
        const follows = await Follow.find({followee: req.params.userID})
        .lean()
        .select('follower')
        .populate('follower', 'iconURL displayName')

        res.json(follows.map(follow => follow.follower))
    } catch (error) {
        res.json({message: error})
    }
})

// GET: a user's followees
router.get('/user/:userID/followees', async (req, res) => {
    try {
        const follows = await Follow.find({follower: req.params.userID})
        .lean()
        .select('followee')
        .populate('followee', 'iconURL displayName')
        res.json(follows.map(follow => follow.followee))
    } catch (error) {
        res.json({message: error})
    }
})

// GET: check if a user follows another user
router.get('/doesfollow', async (req, res) => {
    try {
        const count = await Follow.countDocuments({followee: req.query.followee, follower: req.query.follower})
        res.json({
            doesFollow: count > 0 
        })
    } catch (error) {
        res.status(500).json({message: error})
    }
})

//POST: follow a user
router.post('/', async (req, res) => {
    const follow = new Follow({
        follower: req.body.follower,
        followee: req.body.followee
    })
    try {
        await follow.save()
        res.json({message: 'Did follow user'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// PATCH: unfollow a user 
router.delete('/', async (req, res) => {
    try {
        await Follow.deleteOne({
            follower: req.query.follower,
            followee: req.query.followee
        })
        res.json({message: 'did delete follow'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

module.exports = router