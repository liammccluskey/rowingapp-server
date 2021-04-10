const express = require('express')
const router = express.Router()
const Follow = require('../models/Follow')
const User = require('../models/User')

// PATH: /follows

// GET: a user's follow count info (follwing, followers)
router.get('/uid/:uid/summary', async (req, res) => {
    async function fetchFollowersCount() {
        try {
            return await Follow.countDocuments({followee: req.params.uid})
        } catch (error) { return 0 }
    }
    async function fetchFollowingCount() {
        try {
            return await Follow.countDocuments({follower: req.params.uid})
        } catch (error) { return 0 }
    }
    res.json({
        followers: await fetchFollowersCount(),
        followees: await fetchFollowingCount()
    })
})

// GET: a user's followers
router.get('/uid/:uid/followers', async (req, res) => {
    try {
        const follows = await Follow.find({followee: req.params.uid})
        .lean()
        const followerUIDs = follows.map(follow => follow.follower)
        const followers = await User.find({
            uid: { $in: followerUIDs }
        })
        .select('uid iconURL displayName')
        .lean()

        res.json(followers)
    } catch (error) {
        res.json({message: error})
    }
})

// GET: a user's followees
router.get('/uid/:uid/followees', async (req, res) => {
    try {
        const follows = await Follow.find({follower: req.params.uid})
        .lean()
        const followeeUIDs = follows.map(follow => follow.followee)
        const followees = await User.find({
            uid: { $in: followeeUIDs }
        })
        .select('uid iconURL displayName')
        .lean()

        res.json(followees)
    } catch (error) {
        res.json({message: error})
    }
})

// GET: check if a user follows another user
router.get('/uid/:followerUID/doesfollow/uid/:followeeUID', async (req, res) => {
    try {
        const count = await Follow.countDocuments({followee: req.params.followerUID, followee: req.params.followeeUID})
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
            follower: req.body.follower,
            followee: req.body,followee
        })
        res.json({message: 'did delete follow'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

module.exports = router