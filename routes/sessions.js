const express = require('express')
const router = express.Router()
const Session = require('../models/Session')
const User = require('../models/User')
const Activity = require('../models/Activity')
const Club = require('../models/Club')
const { route } = require('./users')
const moment = require('moment')

// PATH: /sessions

// GET: Sessions that match M/D/Y query
/*
    if req.query.sparse === 1 -> only send minimal (for calendar)
*/
router.get('/uid/:uid', async (req, res) => {
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
    
    let selectedFields
    if (query.sparse === '1') {
        selectedFields = 'startAt title'
    } else {
        selectedFields = 'startAt title associatedClubID hostUID'
    }

    async function fetchClub(clubID) {
        try {
            const club = Club.findById(clubID)
            .select('name iconURL')
            .lean()
            return club
        } catch (error) {
            return {name: 'N/A', iconURL: ''}
        }
    }
    
    try {
        const user = await User
            .findOne({uid: req.params.uid})
            .select('clubIDs')
        const sessions = await Session.find({
            startAt: {$gte: startDate, $lte: endDate},
            $or: [
                {hostUID: req.params.uid},
                {associatedClubID: {$in: user.clubIDs}}
            ]
        })
        .select(selectedFields)
        .sort({startAt: 1})
        .lean()

        if (query.sparse === '0') {
            for (let i = 0; i < sessions.length; i++) {
                if (sessions[i].associatedClubID !== 'none') {
                    sessions[i].club = await fetchClub(sessions[i].associatedClubID)
                }
            }
        }

        res.json(sessions)

    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }

})

// GET: all sessions
router.get('/', async (req,res) => {
    try {
        const sessions = await Session.find()
        res.json(sessions)
    } catch (err) {
        res.status(500).json({message: err})
    }
})

// GET: specific session 
/*
    USE CASE: shallow display of session (only near static info needed)
*/
router.get('/:sessionID', async (req,res) => {
    try {
        const session = await Session.findById(req.params.sessionID)
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
        const session = await Session.findById(req.params.sessionID).select('workoutItems')
        const activities = await Activity.find({
            sessionID: req.params.sessionID
        })
        res.json(
            session.workoutItems.map((item, i) => (
                activities.filter(ac => ac.workoutItemIndex === i)
            ))
        )
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// GET: all users from a session
/*
    USE CASE: Display names (and icon?) of all members of a session
*/
router.get('/:sessionID/members', async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionID).select('memberUIDs')
        if (!session.memberUIDs.length) {
            res.json([])
            return 
        }
        const members = await User.find({
            uid: {
                $in: session.memberUIDs
            }
        }).select('displayName')
        res.json(members)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// POST: create new session
router.post('/', async (req,res) => {
    const session = new Session({
        title: req.body.title,
        hostName: req.body.hostName,
        hostUID: req.body.hostUID,
        startAt: req.body.startAt,
        isAccessibleByLink: req.body.isAccessibleByLink,
        associatedClubID: req.body.associatedClubID,
        workoutItems: req.body.workoutItems
    })
    try {
        const savedSession = await session.save()
        res.json(session)
    } catch (err) {
        res.status(500).json({message: err})
    }
})

// PATCH: join a session
router.patch('/:sessionID/join', async (req, res) => {
    try {
        await Session.findByIdAndUpdate(req.params.sessionID, {
            $addToSet: {
                memberUIDs: req.body.uid
            }
        })
        res.json({message: 'Your request to join this session was succesful'})
    } catch(error) {
        res.status(500).json({message: error})
    }
})

module.exports = router