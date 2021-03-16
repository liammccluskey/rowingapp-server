const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Activity = require('../models/Activity')
const moment = require('moment')
const { months } = require('moment')

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
    // Timeframes are this (week, month, year)
    try {
        const weekActivities = await Activity.find({
            uid: req.params.uid,
            createdAt: {$gte: moment().startOf('week').startOf('day').toDate() } 
        })
        const monthActivities = await Activity.find({
            uid: req.params.uid,
            createdAt: {$gte: moment().startOf('month').startOf('day').toDate() } 
        })
        const yearActivities = await Activity.find({
            uid: req.params.uid,
            createdAt: {$gte: moment().startOf('year').startOf('month').toDate() } 
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
            const dayID = moment(ac.createdAt).day()            // 0 indexed
            week[dayID] += ac.distance
            aggregate.weekMeters += ac.distance
        })
        monthActivities.forEach(ac => {
            const dayID = moment(ac.createdAt).date() - 1       // 1 indexed
            month[dayID] += ac.distance
            aggregate.monthMeters += ac.distance
        })
        yearActivities.forEach( ac => {
            const monthID = moment(ac.createAt).month()         // 0 indexed
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

router.get('/:uid/statistics-full', async (req, res) => {
    // Timeframes are past (week, month, year)
    const weekStart = moment().endOf('day').subtract(1, 'week').startOf('day')
    const monthStart = moment().endOf('day').subtract(1, 'month').startOf('day')
    const yearStart = moment().endOf('day').subtract(1, 'year').startOf('month')

    try {
        const weekActivities = await Activity.find({
            uid: req.params.uid,
            createdAt: {$gte: weekStart.toDate() } 
        })
        const monthActivities = await Activity.find({
            uid: req.params.uid,
            createdAt: {$gte: monthStart.toDate() } 
        })
        const yearActivities = await Activity.find({
            uid: req.params.uid,
            createdAt: {$gte: yearStart.toDate() } 
        })

        const end = moment().endOf('day')
        const monthLength = end.clone().diff( monthStart, 'days')

        const plottable = {
            week: {
                meters: Array(7).fill(0),
                time: Array(7).fill(0),
                calories: Array(7).fill(0)
            },
            month: {
                meters: Array(monthLength).fill(0),
                time: Array(monthLength).fill(0),
                calories: Array(monthLength).fill(0)
            },
            year: {
                meters: Array(12).fill(0),
                time: Array(12).fill(0),
                calories: Array(12).fill(0)
            }
        }

        const aggregate = {
            week : {
                meters: 0,
                time: 0,
                calories: 0
            },
            month: {
                meters: 0,
                time: 0,
                calories: 0
            },
            year: {
                meters: 0,
                time: 0,
                calories: 0
            }
        }

        function extractActivityToJSON(activity, dataIndex, timeframe) {
            aggregate[timeframe].meters += ac.distance
            aggregate[timeframe].time += ac.elapsedTime
            aggregate[timeframe].calories += ac.totalCalories

            plottable[timeframe].meters[dataIndex] += ac.distance
            plottable[timeframe].time[dataIndex] += ac.elapsedTime
            plottable[timeframe].calories[dataIndex] += ac.totalCalories
        }

        weekActivities.forEach(ac => {
            const dataIndex = moment(ac.createdAt).diff(weekStart, 'days')
            extractActivityToJSON(ac, dataIndex, 'week')
        })
        monthActivities.forEach(ac => {
            const dataIndex = moment(ac.createdAt).diff(monthStart, 'days')
            extractActivityToJSON(ac, dataIndex, 'month')
        })
        yearActivities.forEach( ac => {
            const dataIndex = moment(ac.createdAt).diff(yearStart, 'months')
            extractActivityToJSON(ac, dataIndex, 'year')
        })

        res.json({
            aggregate: aggregate,
            plottable: plottable
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