const express = require('express')
const router = express.Router()
const Session = require('../models/Session')
const SessionMember = require('../models/SessionMember')

// PATH: /sessions


// GET: Active sessions hosted by uid, or where [uid in associatedClub.memberIDs]
router.get('/active/:uid', async (req, res) => {
    try {
        const userData = await User
            .findById(req.params.uid)
            .select('clubIDs')

        const sessions = await Session
            .find({
                $or: [
                    {hostUID: uid},
                    {forClubID: { $in: userData.clubIDs } }
                ]
            })
            .sort( { startAt: 1 } )

        res.json(sessions)
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error})
    }
    
})

// GET: all active sessions for a user
router.get('/search', async (req, res) => {
    try {

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
router.get('/:sessionID', async (req,res) => {
    try {
        const session = await Session.findById(req.params.sessionID)
        res.json(session)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err})
    }
})

// POST: create new session
router.post('/', async (req,res) => {
    const session = new Session({
        title: req.body.title,
        hostName: req.body.hostName,
        hostUID: req.body.hostUID,
        startAt: req.body.startAt,
        canAccessByLink: req.body.canAccessByLink,
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

// PATCH: Join a session
router.patch('/:sessionID/join', async (req,res) => {
    const sessionMember = new SessionMember({
        name: req.body.name
    })
    try {
        await Session.findByIdAndUpdate(req.params.sessionID, 
            {$push : {members: sessionMember}}
        )
        res.json(sessionMember)
    } catch (err) {
        console.log("Error joining session: \n" + err)
        res.status(500).json({message: err})
    }
})

// PATCH: Update a member's data -> req.body = SessionMember
router.patch('/:sessionID/members', async (req, res) => {
    const query = {_id: req.params.sessionID, "members._id": req.body._id}
    const update = {$set: {"members.$": req.body}}
    try {
        const updatedSession = await Session.findOneAndUpdate(query, update)
        res.json(updatedSession)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err})
    }
})
    
module.exports = router