const express = require('express')
const router = express.Router()
const Activity = require('../models/Activity')
const Session = require('../models/Session')

// PATH: /activities

// GET: all a users completed activities
/*
    - results are paginated
    - supported sort filters:
        - date, distance, time, pace (asc, desc)
    - supported query filters:
        - distance (<, =, >), time (<,=,>), workoutType (=)
*/
router.get('/search', async (req, res) => {
    const pageSize = Math.min(50, req.query.pagesize)

    const reservedKeys = ['page', 'pagesize', 'sortby']
    const filterQuery = Object.fromEntries(
        Object.entries(req.query).filter(e => 
            !reservedKeys.includes(e[0])
        )
    )

    try {

        const activitiesCount = await Activity.countDocuments(filterQuery)
        const activities = await Activity.find(filterQuery)
        .sort(req.query.sortby)
        .skip( (req.query.page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .populate('session', 'title workoutItems')
        .populate('user', 'displayName iconURL')

        res.json({
            activities: activities,
            count: activitiesCount
        })

    } catch (error) {
        res.status(500).json({message: error})
    }
})


// GET: specific activity by ID
router.get('/:activityID', async (req,res) => {
    try {
        const activity = await Activity.findById(req.params.activityID).lean()
        res.json(activity)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// POST: Create an activity
router.post('/', async (req,res) => {
    const activity = new Activity({
        user: req.body.user,
        workoutItemIndex: req.body.workoutItemIndex,
        session: req.body.session
    })
    try {
        await activity.save()
        res.json({message: 'Did create activity'})
    } catch(error) {
        res.status(500).json({message: error})
    }
})

// PATCH: Update an activity 
/*
    USE CASE: updating user's live data from concept2 
*/
router.patch('/:activityID', async (req,res) => {
    delete req.body._id
    delete req.body.user
    delete req.body.session
    try {
        const updatedActivity = await Activity.findByIdAndUpdate(req.params.activityID, {
            $set: req.body
        })
        res.json({message: 'Did update activity'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

router.patch('/:activityID/complete', async (req, res) => {
    try {
        await Activity.findByIdAndUpdate(req.params.activityID, {
            $set: {isCompleted: true}
        })
        res.json({message: 'Did complete activity'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})


module.exports = router
