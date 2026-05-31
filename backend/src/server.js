const express = require('express')
const cors = require('cors')
const sequelize = require('./database')
require('dotenv').config()

const http = require('http')
const { Server } = require('socket.io')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin:'http://localhost:5173',
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id)

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id)
    })

    socket.on('node:add', (node) => {
        socket.broadcast.emit('node:added', node)
    })

    socket.on('node:move', (data) => {
        socket.broadcast.emit('node:moved', data)
    })

    socket.on('edge:add', (edge) => {
        socket.broadcast.emit('edge:added', edge)
    })

    socket.on('node:delete', (data) => {
        socket.broadcast.emit('node:deleted', data)
    })

    socket.on('node:updateLabel', (data) => {
        socket.broadcast.emit('node:labelUpdated', data)
    })
})

const User = require('./models/user.model')
require('./models/index')

const authRoutes = require('./modules/auth/auth.routes')
app.use('/api/auth', authRoutes)

const networkRoutes = require('./modules/network/network.routes')
app.use('/api/networks', networkRoutes)

app.get('/', (req, res) => {
    res.json({
        message: "NetVerse API running"
    })
})

async function startServer() {
    try {
        await sequelize.authenticate()
        console.log('Database connected successfully!')

        await sequelize.sync()
        console.log('Tables synced sucessfully!')

        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`)
        })
    } catch(err) {
        console.error('Database connection failed: ', err)
    }
}

startServer()