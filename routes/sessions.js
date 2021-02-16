const express = require('express')
const router = express.Router()
const Session = require('../models/Session')
const User = require('../models/User')
const Activity = require('../models/Activity')

// PATH: /sessions


// GET: Active sessions hosted by uid, or where [uid in associatedClub.memberIDs]
router.get('/incomplete/uid/:uid', async (req, res) => {
    try {
        const user = await User
            .findOne({uid: req.params.uid})
            .select('clubIDs')

        const sessions = await Session
            .find({ 
                $or: [
                    {hostUID: req.params.uid},
                    {associatedClubID: { $in: user.clubIDs } }
                ],
                isCompleted: false
            })
            .sort( { startAt: 1 } )

        res.json(sessions)
    } catch(error) {
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
        console.log(err)
        res.status(500).json({message: err})
    }
})

// GET: specific session 
/*
    USE CASE: shallow display of session (not all info needed)
*/
router.get('/:sessionID', async (req,res) => {
    try {
        const session = await Session.findById(req.params.sessionID)
        res.json(session)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err})
    }
})

// GET: activites data from session
/*
    USE CASE: full display of session data (all member activity)
*/
router.get('/:sessionID/activities', async(req, res) => {
    try {
        const session = await Session.findById(req.params.sessionID)
        const activities = await Activity.find({
            _id: {
                $in: session.activityIDs
            }
        })
        res.json(activites)
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
        associatedClubID: req.body.associatedClubID
    })
    console.log(req.body)
    try {
        const savedSession = await session.save()
        res.json(session)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err})
    }
})

// PATCH: join a session
router.patch('/:sessionID/join', async (req, res) => {
    try {
        await Club.findByIdAndUpdate(req.params.sessionID, {
            $addToSet: {
                memberUIDs: req.body.uid,
                activityIDs: req.body.activityID
            }
        })
        res.json({message: 'Your request to join this session was succesful'})
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})
    
module.exports = router