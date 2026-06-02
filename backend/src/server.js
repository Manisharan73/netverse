const express = require('express')
const cors = require('cors')
const sequelize = require('./database')
require('dotenv').config()

const http = require('http')
const { initSocketServer } = require('./websocket/socket.server')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const server = http.createServer(app)
initSocketServer(server)

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