const express = require('express')
const router = express.Router()
const Activity = require('../models/Activity')
const Session = require('../models/Session')
const Follow = require('../models/Follow')
const moment = require('moment')

// PATH: /feed

// GET: get activities for a user's dashboard
/*  req.query params
    - user -> user._id
    - page -> page num on client
    - pagesize -> assume 10 for this
*/
router.get('/dashboard', async (req, res) => {
    const pageSize = Math.min(50, req.query.pagesize)
    try {
        const followees = await Follow.find({follower: req.query.user})
        .select('followee')
        .lean()
        const followeeIDs = followees.map(f => f.followee)

        const activities = await Activity.find({
            user: {$in: [...followeeIDs, req.query.user]}
        })
        .lean()
        .sort('-createdAt')
        .skip( (req.query.page - 1) * pageSize)
        .limit(pageSize)
        .populate('session', 'title workoutItems')
        .populate('user', 'displayName iconURL')

        res.json(activities)

    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// GET: sessions for club-profile feed
/*  req.query params
    - club -> club._id
    - page -> page num on client
    - pagesize -> assume 10 for this
*/
router.get('/club-profile', async (req, res) => {
    const pageSize = Math.min(50, req.query.pagesize)
    
    const currTime = moment()
    try {
        const sessions = await Session.find({
            club: req.query.club,
            startAt: {$lte: currTime.toDate()}
        })
        .lean()
        .sort('-startAt')
        .skip( (req.query.page - 1) * pageSize)
        .limit(pageSize)
        .select('-members')
        .populate('club', 'name iconURL')

        res.json(sessions)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// GET: get activities for athlete profile
/*  req.query params
    - user -> user._id
    - page -> page num on client
    - pagesize -> assume 10 for this
*/
router.get('/athlete-profile', async (req, res) => {
    const pageSize = Math.min(50, req.query.pagesize)
    try {
        const activities = await Activity.find({
            user: req.query.user
        })
        .lean()
        .sort('-createdAt')
        .skip( (req.query.page - 1) * pageSize)
        .limit(pageSize)
        .populate('session', 'title workoutItems')
        .populate('user', 'displayName iconURL')

        res.json(activities)

    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})




module.exports = router