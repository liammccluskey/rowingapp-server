const express = require('express')
const router = express.Router()
const ClubMembership = require('../models/ClubMembership')
const Club = require('../models/Club')
const User = require('../models/User')

// GET : clubs a user belongs to
/*
    Usage: dashboard -> what clubs am I in
*/
router.get('/user/:userID', async (req, res) => {
    try {
        const memberships = await ClubMembership.find({
            user: req.params.userID,
            role: {$gte: 0}
        })
        .lean()
        .select('club')
        .populate('club', 'name iconURL customURL')

        res.json(memberships.map(membership => membership.club))
    } catch (error) {
        res.status(500).json({message: error.message})
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
        .populate('user', 'displayName iconURL uid')
        res.json(memberships.map(membership => ( {...membership.user, role: membership.role} ) ))
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// GET: get a user's role in a club
router.get('/ismember', async (req, res) => {
    try {
        const membership = await ClubMembership.findOne({
            user: req.query.user, club: req.query.club
        }).lean()
        .select('role')

        res.json({
            isMember: !!membership,
            role: membership ? membership.role : -1
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH: transfer club ownership
/*
    - req.body
        - fromUser: _id
        - toUser: _id
        - club: _id
*/
router.patch('/transferOwnership', async (req, res) => {
    try {
        const requestingUser = await ClubMembership.findOne(
            {club: req.body.club, user: req.body.fromUser}
        ).lean()
        if (requestingUser.role !== 2) {
            throw new Error('You do not have permission to perform this action')
        }
        await ClubMembership.findOneAndUpdate(
            {club: req.body.club, user: req.body.fromUser},
            {$set: {role: 1}}
        )
        await ClubMembership.findOneAndUpdate(
            {club: req.body.club, user: req.body.toUser},
            {role: 2}
        )
        res.json({message: 'Successfully transferred club ownership'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH: make a member an admin
router.patch('/makeAdmin', async (req, res) => {
    try {
        const requestingUser = await ClubMembership.findOne(
            {club: req.body.club, user: req.body.requestingUser}
        ).lean()
        const user = await ClubMembership.findOne(
            {club: req.body.club, user: req.body.user}
        ).lean()
        if (requestingUser.role < 1) {
            throw new Error('You do not have permission to perform this action')
        } else if (user.role === 2) {
            throw new Error('You cannot demote the club owner to admin')
        }
        await ClubMembership.findOneAndUpdate(
            {club: req.body.club, user: req.body.user},
            {$set: {role: 1}}
        )
        res.json({message: 'Successfully added club admin'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH: revoke a member's admin role
router.patch('/revokeAdmin', async (req, res) => {
    try {
        const requestingUser = await ClubMembership.findOne(
            {club: req.body.club, user: req.body.requestingUser}
        ).lean()
        const user = await ClubMembership.findOne(
            {club: req.body.club, user: req.body.user}
        ).lean()
        if (requestingUser.role < 1 || user.role === 2) {
            throw new Error('You do not have permission to perform this action')
        }
        await ClubMembership.findOneAndUpdate(
            {club: req.body.club, user: req.body.user},
            {$set: {role: 0}}
        )
        res.json({message: 'Successfully revoked admin'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// PATCH: Approve a member's join request
router.patch('/makeMember', async (req, res) => {
    try {
        const requestingUser = await ClubMembership.findOne(
            {club: req.body.club, user: req.body.requestingUser}
        ).lean()
        const user = await ClubMembership.findOne(
            {club: req.body.club, user: req.body.user}
        ).lean()
        if (requestingUser.role < 1 || user.role === 2) {
            throw new Error('You do not have permission to perform this action')
        }
        await ClubMembership.findOneAndUpdate(
            {club: req.body.club, user: req.body.user},
            {$set: {role: 0}}
        )
        res.json({message: 'Successfully approved request to join'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// DELETE: delete a member || deny request
router.delete('/revokeMembership', async (req, res) => {
    try {
        let message
        const requestingUser = await ClubMembership.findOne(
            {club: req.query.club, user: req.query.requestingUser}
        ).lean()
        const user = await ClubMembership.findOne(
            {club: req.query.club, user: req.query.user}
        ).lean()
        if (requestingUser.role < 1) {
            throw new Error('You do not have permission to perform this action')
        } else if (user.role === 2) {
            throw new Error('The club owner cannot be removed from the club')
        } else if (user.role === -1) {
            message = 'Successfully denied request to join'
        } else {
            message = 'Successfully removed club member'
        }

        await ClubMembership.deleteOne({user: req.query.user, club: req.query.club})
        res.json({message: message})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// POST: join a club
router.post('/', async (req, res) => {
    try {
        let message = ''
        const membership = new ClubMembership({
            club: req.body.club,
            user: req.body.user,
            role: -1
        })
        const club = await Club.findById(req.body.club)
        .lean()
        .select('name isPrivate')
        const ownersCount = await ClubMembership.countDocuments(
            {club: req.body.club, role: 2}
        )

        if (ownersCount === 0) {
            membership.role = 2
            message = `Successfully joined ${club.name} as owner`
        } else if (club.isPrivate) {
            membership.role = -1
            message = `Your request to join ${club.name} has been submitted`
        } else {
            membership.role = 0
            message = `Successfully joined ${club.name}`
        }

        await membership.save()
        res.json({message: message})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

// DELETE: leave a club
router.delete('/leave', async (req, res) => {
    try {
        let message
        const user = await ClubMembership.findOne(
            {club: req.query.club, user: req.query.user}
        ).lean()
        if (user.role === 2) {
            throw new Error('Club owners must transfer their ownership before leaving a club')
        } else if (user.role >= 0) {
            message = 'Successfully left club'
        } else if (user.role === -1 ) {
            message = 'Your request to join has been cancelled'
        } else {
            message = 'You do not belong to this club'
        }
        await ClubMembership.deleteOne({user: req.query.user, club: req.query.club})
        res.json({message: message})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router