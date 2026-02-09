import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import { initDb } from './db/sqlite.js'
import instancesRouter from './routes/instances.js'
import { initWebSocket } from './services/websocket.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Initialize database
initDb()

// Middleware
// Configure CORS to allow frontend from different domain (e.g., Vercel)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173']

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())
app.use(clerkMiddleware())

// API Routes - must be before static files
app.use('/api/instances', requireAuth(), instancesRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Static files - serve built frontend
app.use(express.static(path.join(__dirname, '../dist')))

// SPA fallback - serve index.html for client-side routing
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// Initialize WebSocket
initWebSocket(server)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
