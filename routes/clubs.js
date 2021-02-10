const express = require('express')
const router = express.Router()
const Club = require('../models/Club')
const User = require('../models/User')


// PATH: /clubs

// GET: search for clubs with query
router.get('/search', async (req, res) => {
    console.log(req.query)
    try {
        const clubs = await Club.find(req.query)
        res.json(clubs)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// GET: search for one club with query 
router.get('/search-one', async (req, res) => {
    console.log(req.query)
    try {
        const club = await Club.findOne(req.query)
        res.json(club)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// GET: get a specific club by ID
router.get('/:clubID', async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubID)
        res.json(club)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// POST: create new club
router.post('/', async (req, res) => {
    const club = new Club({
        name: req.body.name,
        memberUIDs: [req.body.uid],
        adminUIDs: [req.body.uid],
        customURL: req.body.customURL,
        description: req.body.description
    })
    try {
        const savedClub = await club.save()
        await User.findByIdAndUpdate(req.body.uid,
            {$addToSet: {clubIDs: savedClub._id}}
        )
        console.log('did create an join club')
        res.json(savedClub)
    } catch (error) {
        res.json({message: error})
        console.log(error)
    }
})

router.post('/:clubID/join', async (req,res) => {
    console.log()
    try {
        const updatedClub = await Club.findByIdAndUpdate(req.params.clubID, 
            {$addToSet: {memberUIDs: req.body.uid}}
        )
        await User.findByIdAndUpdate(req.body.uid,
            {$addToSet: {clubIDs: req.params.clubID}}
        )
        console.log('did join club')
        res.json(updatedClub)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})



 module.exports = router