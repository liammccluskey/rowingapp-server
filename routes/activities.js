const express = require('express')
const router = express.Router()
const Activity = require('../models/Activity')
const Session = require('../models/Session')

// PATH: /activities

router.get('/test', async (req, res) => {
    const reservedKeys = ['page', 'pagesize', 'sortby']
    const filterQuery = Object.fromEntries(
        Object.entries(req.query).filter(e => 
            !reservedKeys.includes(e[0])
        )
    )

    try {
        const activities = await Activity.find(filterQuery)
        .sort(req.query.sortby)

        res.json(activities)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// GET: all a users complted activities
/*
    - results are paginated
    - supported sort filters:
        - date, distance, time, pace (asc, desc)
    - supported query filters:
        - distance (<, =, >), time (<,=,>), workoutType (=)
*/
router.get('/uid/:uid', async (req, res) => {
    const pageSize = Math.min(50, req.query.pagesize)

    const reservedKeys = ['page', 'pagesize', 'sortby']
    const filterQuery = Object.fromEntries(
        Object.entries(req.query).filter(e => 
            !reservedKeys.includes(e[0])
        )
    )
    async function fetchSession(sessionID) {
        try {
            const session = Session.findById(sessionID)
            .select('title hostUID associatedClubID workoutItems')
            .lean()
            return session
        } catch (error) {
            return {title: '', hostUID: '', associatedClubID: ''}
        }
    }
    try {
        const activitiesCount = await Activity.find({
            uid: req.params.uid,
            ...filterQuery
        })
        .countDocuments()

        const activities = await Activity.find({
            uid: req.params.uid,
            ...filterQuery
        })
        .sort(req.query.sortby)
        .skip( (req.query.page - 1) * pageSize)
        .limit(pageSize)
        .select('distance elapsedTime averagePace workoutType workoutItemIndex sessionID createdAt')
        .lean()

        for (let i = 0; i < activities.length; i++) {
            const session = await fetchSession(activities[i].sessionID)
            activities[i].title = session.workoutItems[activities[i].workoutItemIndex]

            delete session.workoutItems
            delete activities[i].workoutItemIndex

            activities[i].session = session
        }

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
        uid: req.body.uid,
        name: req.body.name,
        workoutItemIndex: req.body.workoutItemIndex,
        sessionID: req.body.sessionID
    })
    try {
        const savedActivity = await activity.save()
        res.json(savedActivity)
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
    try {
        const updatedActivity = await Activity.findByIdAndUpdate(req.params.activityID, {
            $set: req.body
        })
        res.json({message: 'your activity was updated successfully'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

router.patch('/:activityID/complete', async (req, res) => {
    try {
        await Activity.findByIdAndUpdate(req.params.activityID, {
            $set: {isCompleted: true}
        })
        res.json({message: 'your request to finish this activity was successful'})
    } catch (error) {
        res.status(500).json({message: error})
    }
})


module.exports = router
