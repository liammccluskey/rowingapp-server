// push changes to heroku
// git add .
// git commit -am "some message"
// git push heroku master

const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv/config')

// Middleware
app.use(cors())
app.use(express.json())

// Routes
const sessionsRoute = require('./routes/sessions')
app.use('/sessions', sessionsRoute)

const usersRoute = require('./routes/users')
app.use('/users', usersRoute)

const clubsRoute = require('./routes/clubs')
app.use('/clubs', clubsRoute)

mongoose.connect(process.env.DB_CONNECTION ,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false}, () => {
        console.log('Connected to DB')
})

app.listen(process.env.PORT || 3000)