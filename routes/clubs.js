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
    const pageSize = 15
    const query = {
        $text: {
            $search : req.query.name
        }
    }
    try {
        const count = await Club.find(query).countDocuments()

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

        club.members =  await User.find({
            uid: {$in: club.memberUIDs}
        })
        .select('displayName')
        .sort('displayName')
        .lean()

        club.admins = await User.find({
            uid: {$in: club.adminUIDs}
        })
        .select('displayName')
        .sort('displayName')
        .lean()

        res.json(club)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})

// GET: get a specific club by ID
/*
    - usage: minimal fetch, for use other than club page
*/
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
        description: req.body.description,
        iconURL: req.body.iconURL
    })
    try {
        const savedClub = await club.save()
        await User.findOneAndUpdate(
            {uid: req.body.uid},
            {$addToSet: {clubIDs: req.params.clubID}}
        )
        res.json(savedClub)
    } catch (error) {
        res.json({message: error})
        console.log(error)
    }
})

router.patch('/:clubID/join', async (req,res) => {
    try {
        const updatedClub = await Club.findByIdAndUpdate(req.params.clubID, 
            {$addToSet: {memberUIDs: req.body.uid}}
        )
        await User.findOneAndUpdate(
            {uid: req.body.uid},
            {$addToSet: {clubIDs: req.params.clubID}}
        )
        res.json(updatedClub)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})



 module.exports = router

 