const express = require('express')
const router = express.Router()
const ClubMembership = require('../models/ClubMembership')
const Club = require('../models/Club')
const User = require('../models/User')
const { deleteOne } = require('../models/Club')

// GET : clubs a user belongs to
/*
    Usage: dashboard -> what clubs am I in
*/
router.get('/user/:userID', async (req, res) => {
    try {
        const memberships = await ClubMembership.find({user: req.params.userID})
        .select('club')
        .lean()
        .populate('club', 'name iconURL customURL')

        res.json(memberships.map(membership => membership.club))
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// GET : all users in a club
/*
    Usage: clubpage.members -> show all club members
    NOTE: should paginate results, not done currently
*/
router.get('/club/:clubID', async (req, res) => {
    try {
        const memberships = await ClubMembership.find({club: req.params.clubID})
        .select('user role')
        .lean()
        .populate('user', 'displayName iconURL')
        res.json(memberships.map(membership => ( {...membership.user, role: membership.role} ) ))
    } catch (error) {
        res.status(500).json({message: error})
    }
})
// POST: join a club
router.post('/', async (req, res) => {
    try {
        const membership = new ClubMembership({
            club: req.body.club,
            user: req.body.user,
            role: req.body.role
        })
        await membership.save()
        res.json({message: 'Did join club'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// DELETE: leave a club
router.delete('/', async (req, res) => {
    try {
        await deleteOne({user: req.query.user, club: req.query.club})
        res.json({message: 'Did delete club'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

module.exports = router