const express = require('express')
const router = express.Router()
const Club = require('../models/Club')


// PATH: /clubs

// GET: get a club
router.post('/:clubID', async (req, res) => {
    try {
        const club = Club.findById(req.params.clubID)
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
        customURL: req.body.customURL
    })
    try {
        const savedClub = await club.save()
        res.json(savedPost)
    } catch (error) {
        res.json({message: error})
        console.log(error)
    }
})