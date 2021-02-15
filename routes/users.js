const express = require('express')
const router = express.Router()
const User = require('../models/User')

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
    console.log(req.params.uid)
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


// POST: create a new user
router.post('/', async (req, res) =>{
    // check if user exists
    const user = new User({
        displayName: req.body.displayName,
        uid: req.body.firebaseUID
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