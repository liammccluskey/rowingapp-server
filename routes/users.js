const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Activity = require('../models/Activity')
const moment = require('moment')

// PATH: /users

// GET: a user's id on login
router.get('/uid/:uid', async (req, res) => {
    try {
        const user = await User.findOne({uid: req.params.uid})
        .lean()
        res.json(user)
    } catch (error) {
        console.log(error)
    }
})

// GET: a user by uid
router.get('/:userID', async (req, res) => {
    try {
        const user = await User.findById(req.params.userID)
        .lean()
        res.json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// GET: a users's stats (for dashboard)
router.get('/:userID/statistics', async (req, res) => {
    // Timeframes are this (week, month, year)
    try {
        const weekActivities = await Activity.find({
            userID: req.params.userID,
            createdAt: {$gte: moment().startOf('week').startOf('day').toDate() } 
        })
        const monthActivities = await Activity.find({
            userID: req.params.userID,
            createdAt: {$gte: moment().startOf('month').startOf('day').toDate() } 
        })
        const yearActivities = await Activity.find({
            userID: req.params.userID,
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

router.get('/:userID/statistics-general', async (req, res) => {
    // Timeframes are past (week, month, year)
    const weekStart = moment().subtract(1, 'week').startOf('day')
    const monthStart = moment().subtract(1, 'month').startOf('day')
    const yearStart = moment().subtract(1, 'year').startOf('month')

    try {
        // past timeframes
        const weekActivities = await Activity.find({
            userID: req.params.userID,
            createdAt: {$gte: weekStart.clone().toDate() } 
        }).lean()
        const monthActivities = await Activity.find({
            userID: req.params.userID,
            createdAt: {$gte: monthStart.clone().toDate() } 
        }).lean()
        const yearActivities = await Activity.find({
            userID: req.params.userID,
            createdAt: {$gte: yearStart.clone().toDate() } 
        }).lean()

        // past past timeframes
        const prevWeekActivities = await Activity.find({
            userID: req.params.userID,
            createdAt: {$gte: weekStart.clone().subtract(1, 'week').toDate(), $lte: weekStart.clone().toDate() } 
        }).lean()
        const prevMonthActivities = await Activity.find({
            userID: req.params.userID,
            createdAt: {$gte: monthStart.clone().subtract(1, 'month').toDate(), $lte: monthStart.clone().toDate() } 
        }).lean()
        const prevYearActivities = await Activity.find({
            userID: req.params.userID,
            createdAt: {$gte: yearStart.clone().subtract(1, 'year').toDate(), $lte: yearStart.clone().toDate() } 
        }).lean()

        const monthLength = moment().diff( monthStart, 'days')
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
                meters: Array(13).fill(0),
                time: Array(13).fill(0),
                calories: Array(13).fill(0)
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

        const aggregatePrev = JSON.parse(JSON.stringify(aggregate))

        function extractActivityToJSON(ac, dataIndex, timeframe) {
            aggregate[timeframe].meters += Math.round(ac.distance)
            aggregate[timeframe].time += Math.round(ac.elapsedTime)
            aggregate[timeframe].calories += Math.round(ac.totalCalories)

            plottable[timeframe].meters[dataIndex] += Math.round(ac.distance)
            plottable[timeframe].time[dataIndex] += Math.round(ac.elapsedTime)
            plottable[timeframe].calories[dataIndex] += Math.round(ac.totalCalories)
        }

        // extract curr stats
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

        function extractPrevActivityToJSON(ac, timeframe) {
            aggregatePrev[timeframe].meters += Math.round(ac.distance)
            aggregatePrev[timeframe].time += Math.round(ac.elapsedTime)
            aggregatePrev[timeframe].calories += Math.round(ac.totalCalories)
        }

        // extract prev timeframe stats (percent change)
        prevWeekActivities.forEach(ac => { extractPrevActivityToJSON(ac, 'week') })
        prevMonthActivities.forEach(ac => { extractPrevActivityToJSON(ac, 'month') })
        prevYearActivities.forEach(ac => { extractPrevActivityToJSON(ac, 'year') })

        const timeframes = ['week', 'month', 'year']
        const metrics = ['meters', 'time', 'calories']
        timeframes.forEach(timeframe => 
            metrics.forEach(metric => {
                const init = aggregatePrev[timeframe][metric]
                const final = aggregate[timeframe][metric]
                if (init === 0) {
                    aggregatePrev[timeframe][metric] = 0
                } else {
                    aggregatePrev[timeframe][metric] = Math.round( (final - init)/init * 100 )
                }
            })
        )

        res.json({
            aggregate: aggregate,
            plottable: plottable,
            delta: aggregatePrev
        })    
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// GET: plottable (line chart) activity trends (pace progression)
/*
    NOTE: currently only supports pace data
*/
router.get('/:userID/statistics-progress', async (req, res) => {
    const startDates = [
        moment().subtract(1, 'week').startOf('day'),    // week
        moment().subtract(1, 'month').startOf('day'),   // month
        moment().subtract(1, 'year').startOf('month'),  // year
    ]

    const keys = ['week', 'month', 'year']
    // response
    let summary = {
        week: {
            min: Infinity, max: -Infinity, avg: 0,
            count: 0,
        },
        month: {
            min: Infinity, max: -Infinity, avg: 0,
            count: 0,
        },
        year: {
            min: Infinity, max: -Infinity, avg: 0,
            count: 0
        }
    }
    let plottable = {
        week: [],
        month: [],
        year: []
    }

    try {
        const queries = startDates.map(startDate => (
            {
                userID: req.params.userID,
                createdAt: { $gte: startDate.toDate() },
                workoutType: { $gte: 0, $lte: 5},
                distance: { $gte: req.query.gte, $lte: req.query.lte }
            }
        ))
        
        const activitiesByTimeframe = [
            await Activity.find(queries[0]).sort( { createdAt: 1 }).lean(),
            await Activity.find(queries[1]).sort( { createdAt: 1 }).lean(),
            await Activity.find(queries[2]).sort( { createdAt: 1 }).lean()
        ]

        activitiesByTimeframe.forEach( (activities, i) => {
            const key = keys[i]

            plottable[key] = activities.map(ac => ({
                y: ac.averagePace,
                x: moment(ac.createdAt)
            }))

            summary[key].count = activities.length
            let sum = 0
            activities.forEach( ac => {
                summary[key].max = Math.max(summary[key].max, ac.averagePace)
                summary[key].min = Math.min(summary[key].min, ac.averagePace)
                sum += ac.averagePace
            })
            summary[key].avg = sum / activities.length
        })

        res.json({
            summary: summary,
            plottable: plottable
        })


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
        uid: req.body.uid,
        iconURL: req.body.iconURL
    })
    try {
        await user.save()
        res.json({message: 'Did create user'})
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// PATCH: update user color pref
router.patch('/:userID/color-theme', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userID, {
            $set: {
                usesDarkMode: req.body.usesDarkMode
            }
        })
        res.json({message: 'Changes saved'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// PATH: update user iconURL
router.patch('/:userID/iconURL', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userID, {
            $set: {
                iconURL: req.body.iconURL
            }
        })
        res.json({message: 'Changes saved'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

router.patch('/:userID/displayName', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userID,{
            $set: {
                displayName: req.body.displayName
            }
        })
    } catch (error) {
        res.status(500).json({message: error})
    }
})

module.exports = router