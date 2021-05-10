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

const activitesRoute = require('./routes/activities')
app.use('/activities', activitesRoute)

const followsRoute = require('./routes/follows')
app.use('/follows', followsRoute)

const clubMembershipsRoute = require('./routes/clubmemberships')
app.use('/clubmemberships', clubMembershipsRoute)

const commentsRoute = require('./routes/comments')
app.use('/comments', commentsRoute)

const likesRoute = require('./routes/likes')
app.use('/likes', likesRoute)

mongoose.connect(process.env.DB_CONNECTION ,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false}, () => {
        console.log('Connected to DB')
})

const server = app.listen(process.env.PORT || 3000)


// socketio
const socketIO = require('socket.io')
const io = socketIO(server)
app.set('socketio', io)

io.on('connection', socket => {
    socket.on('join_room', data => {
        socket.join(data.room)
        io.to(data.room).emit('join_room', {user: data.user})
    })

    socket.on('send_message', data => {
        io.to(data.room).emit('receive_message', data)
    })
})
