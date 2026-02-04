import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import { initDb } from './db/sqlite'
import instancesRouter from './routes/instances'
import { initWebSocket } from './services/websocket'

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Initialize database
initDb()

// Middleware
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

// Routes
app.use('/api/instances', requireAuth(), instancesRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Initialize WebSocket
initWebSocket(server)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
