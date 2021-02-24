const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Activity = require('../models/Activity')
const moment = require('moment')

// PATH: /users

// GET: get a user
router.get('/', async (req,res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})


router.get('/:uid', async (req, res) => {
    try {
        const user = await User.findOne({
            uid: req.params.uid
        })
        res.json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})


// GET: get use stats (week, month, year meters) AND (user pr's)
router.get('/:uid/stats', async (req, res) => {
    console.log('did hit user stats route')
    console.log(moment().startOf('year'))
    try {
        const y = await Activity.aggregate([
            {$match: {
                $and: [
                    {uid: req.params.uid},
                    {createdAt: {$gte: moment().startOf('year').toDate()}}
                ]
            }},
            {$group: {
                _id: null,
                meters: {$sum: '$totalDistance'}
            }}
        ])
        const m = await Activity.aggregate([
            {$match: {
                $and: [
                    {uid: req.params.uid},
                    {createdAt: {$gte: moment().startOf('month').toDate()}}
                ]
            }},
            {$group: {
                _id: null,
                meters: {$sum: '$totalDistance'}
            }}
        ])
        const w = await Activity.aggregate([
            {$match: {
                $and: [
                    {uid: req.params.uid},
                    {createdAt: {$gte: moment().startOf('week').toDate() }}
                ]
            }},
            {$group: {
                _id: null,
                meters: {$sum: '$totalDistance'}
            }}
        ])
        console.log({
            year: y,
            month: m,
            week: w
        })
        const stats = {
            week: w.length ? w[0].meters : 0,
            month: m.length ? m[0].meters : 0,
            year: y.length ? y[0].meters : 0
        }
        res.json(stats)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})


// POST: create a new user
router.post('/', async (req, res) =>{
    // check if user exists
    const user = new User({
        displayName: req.body.displayName,
        uid: req.body.uid
    })
    try {
        const newUser = await user.save()
        res.json(newUser)
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

module.exports = router