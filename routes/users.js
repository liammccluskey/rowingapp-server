const express = require('express')
const router = express.Router()
const User = require('../models/User')

// PATH: /users

// GET: get a user
router.post('/:uid', async (req, res) => {
    try {
        const user = User.findById(req.params.uid)
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
        firebaseUID: firebaseUID
    })
    try {
        const newUser = await user.save()
        res.json(newUser)
    } catch(error) {
        console.log(error)
        res.json({message: error})
    }
})



module.exports = router