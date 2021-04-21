const express = require('express')
const router = express.Router()
const Session = require('../models/Session')
const User = require('../models/User')
const ClubMembership = require('../models/ClubMembership')
const Activity = require('../models/Activity')
const Club = require('../models/Club')
const { route } = require('./users')
const moment = require('moment')

// PATH: /sessions

// GET: Sessions that match M/D/Y query
/*
    if req.query.sparse === 1 -> only send minimal (for calendar)
*/
router.get('/user/:userID', async (req, res) => {
    const query = req.query
    let startDate
    let endDate

    if (req.query.hasOwnProperty('day')) {
        startDate = moment([query.year, query.month, query.day]).startOf('day').toDate()
        endDate = moment([query.year, query.month, query.day]).endOf('day').toDate()
    } else {
        startDate = moment([query.year, query.month]).startOf('month').toDate()
        endDate = moment([query.year, query.month]).endOf('month').toDate()
    }
 
    try {
        const memberships = await ClubMembership.find({user: req.params.userID})
        .lean()
        .select('club -_id')

        const sessions = query.sparse === '1' ? 
            await Session.find({
                startAt: {$gte: startDate, $lte: endDate},
                $or: [
                    {hostUser: req.params.userID},
                    {club: {$in: memberships.map(m => m.club)}}
                ]
            })
            .select('startAt title')
            .sort('startAt')
            .lean()
            :
            await Session.find({
                startAt: {$gte: startDate, $lte: endDate},
                $or: [
                    {hostUser: req.params.userID},
                    {club: {$in: memberships.map(m => m.club)}}
                ]
            })
            .sort('startAt')
            .lean()
            .populate('club', 'name iconURL')
            .populate('hostUser', 'displayName iconURL')

        res.json(sessions)

    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }

})

// GET: sessions for club feed
router.get('/feed/club/:clubID', async (req, res) => {
    const endTime = moment()
    const startTime = start.clone().subtract(1, 'month')
    try {
        const sessions = await Session.find({
            club: req.params.clubID,
            startAt: {$gte: startTime.toDate(), $lte: endTime.toDate()}
        })
        .lean()
        .sort('-startAt')
        .limit(30)
        .populate('club', 'name iconURL')

        res.json(sessions)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// GET: specific session
router.get('/:sessionID', async (req,res) => {
    try {
        const session = await Session.findById(req.params.sessionID)
        .lean()
        .populate('club', 'name iconURL')
        .populate('hostUser', 'displayName iconURL')
        .populate('members', 'displayName iconURL')
        res.json(session)
    } catch (err) {
        res.status(500).json({message: err})
    }
})



// GET: activites data from session
/*
    USE CASE: full display of session members' activity (all member activity)
*/
router.get('/:sessionID/activities', async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionID)
        .select('workoutItems')
        .lean()
        const activities = await Activity.find({session: req.params.sessionID})
        .populate('user', 'displayName iconURL')
        .lean()
        res.json(
            session.workoutItems.map((item, i) => (
                activities.filter(ac => ac.workoutItemIndex === i)
            ))
        )
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// POST: create new session
router.post('/', async (req,res) => {
    const session = new Session({
        title: req.body.title,
        hostUser: req.body.hostUser,
        startAt: req.body.startAt,
        isAccessibleByLink: req.body.isAccessibleByLink,
        club: req.body.club,
        workoutItems: req.body.workoutItems
    })
    try {
        await session.save()
        res.json({message: 'Did create session'})
    } catch (err) {
        res.status(500).json({message: err})
    }
})

// PATCH: join a session
router.patch('/:sessionID/join', async (req, res) => {
    try {
        await Session.findByIdAndUpdate(req.params.sessionID, {
            $addToSet: {
                members: req.body.user
            }
        })
        res.json({message: 'Did join session'})
    } catch(error) {
        res.status(500).json({message: error})
    }
})

module.exports = router