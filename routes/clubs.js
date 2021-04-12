const express = require('express')
const router = express.Router()
const Club = require('../models/Club')
const User = require('../models/User')


// PATH: /clubs

// GET: clubs a user belongs to
router.get('/uid/:uid', async (req, res) => {
    try {
        const user = await User
            .findOne({uid: req.params.uid}).lean()
            .select('clubIDs')

        const clubs = await Club
            .find(
                { _id: { $in: user.clubIDs } }
            )
        res.json(clubs)
    } catch(error) {
        res.status(500).json({message: error})
    }
})


// GET: search for clubs with query
/*
    supported fields: name
    required field: page
*/
router.get('/search', async (req, res) => {
    const pageSize = Math.min(50, req.query.pagesize)

    const query = {
        $text: {
            $search : req.query.name
        }
    }

    try {
        const count = await Club.countDocuments(query)

        const clubs = await Club.find(query)
        .skip((req.query.page - 1)*pageSize)
        .limit(pageSize)
        .lean()

        res.json({
            clubs: clubs,
            count: count
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// GET: get a specific club by customURL
/*
    usage: full fetch, on club page
*/
router.get('/customURL/:customURL', async (req, res) => {
    try {
        const club = await Club.findOne({
            customURL: req.params.customURL
        })
        .lean()

        res.json(club)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// GET: get a specific club by ID
/*
    - usage: for use other than club page
*/
router.get('/:clubID', async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubID)
        .lean()
        res.json(club)
    } catch (error) {
        res.status(500).json({message: error})
    }
})

// POST: create new club
router.post('/', async (req, res) => {
    const club = new Club({
        name: req.body.name,
        customURL: req.body.customURL,
        description: req.body.description,
        iconURL: req.body.iconURL
    })
    try {
        await club.save()
        res.json({message: 'did create club'})
    } catch (error) {
        res.json({message: error})
    }
})

 module.exports = router

 