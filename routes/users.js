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

router.get('/:uid/statistics', async (req, res) => {
    try {
        const weekActivities = await Activity.find({
            uid: req.params.uid,
            createdAt: {$gte: moment().startOf('week').toDate() } 
        })
        const monthActivities = await Activity.find({
            uid: req.params.uid,
            createdAt: {$gte: moment().startOf('month').toDate() } 
        })
        const yearActivities = await Activity.find({
            uid: req.params.uid,
            createdAt: {$gte: moment().startOf('year').toDate() } 
        })

        const week = Array(7).fill(0)
        const month = Array(moment().daysInMonth()).fill(0)
        const year = Array(12).fill(0)

        const aggregate = {
            weekMeters: 0,
            monthMeters: 0,
            yearMeters: 0
        }

        weekActivities.forEach(ac => {
            const dayID = moment.utc(ac.createdAt).day() // 0 indexed
            week[dayID] += ac.distance
            aggregate.weekMeters += ac.distance
        })
        monthActivities.forEach(ac => {
            const dayID = moment.utc(ac.createdAt).date() - 1       // 1 indexed
            month[dayID] += ac.distance
            aggregate.monthMeters += ac.distance
        })
        yearActivities.forEach( ac => {
            const monthID = moment.utc(ac.createAt).month()         // 0 indexed
            year[monthID] += ac.distance
            aggregate.yearMeters += ac.distance
        })

        res.json({
            aggregate: aggregate,
            plottable: {
                weekMeters: week,
                monthMeters: month,
                yearMeters: year
            }
        })    
    } catch (error) {
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

// PATCH: update user color pref
router.patch('/:uid/color-theme', async (req, res) => {
    try {
        await User.findOneAndUpdate(
            {uid: req.params.uid},
            {$set: {
                usesDarkMode: req.body.usesDarkMode
            }}
        )
        res.json({message: 'color theme update sucessful'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

module.exports = router