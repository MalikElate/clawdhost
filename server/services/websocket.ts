import { Server as HttpServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { getInstanceById } from '../db/sqlite'
import { getContainerPort } from './docker'

interface ClientConnection {
  ws: WebSocket
  instanceId: string
  moltbotWs?: WebSocket
}

const clients = new Map<WebSocket, ClientConnection>()

export function initWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/api/ws' })

  wss.on('connection', (ws, req) => {
    // Extract instance ID from URL: /api/ws/:instanceId
    const url = new URL(req.url || '', `http://${req.headers.host}`)
    const pathParts = url.pathname.split('/')
    const instanceId = pathParts[pathParts.length - 1]

    if (!instanceId) {
      ws.close(1008, 'Instance ID required')
      return
    }

    console.log(`WebSocket connection for instance: ${instanceId}`)

    const client: ClientConnection = { ws, instanceId }
    clients.set(ws, client)

    // Connect to Moltbot container
    connectToMoltbot(client)

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        if (message.type === 'message' && client.moltbotWs) {
          // Forward message to Moltbot
          client.moltbotWs.send(JSON.stringify({
            type: 'message',
            content: message.content,
          }))
        }
      } catch (error) {
        console.error('Failed to process WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      const client = clients.get(ws)
      if (client?.moltbotWs) {
        client.moltbotWs.close()
      }
      clients.delete(ws)
    })
  })
}

async function connectToMoltbot(client: ClientConnection) {
  const instance = getInstanceById(client.instanceId)
  if (!instance || !instance.container_id) {
    client.ws.send(JSON.stringify({
      type: 'error',
      message: 'Instance not found or not running',
    }))
    return
  }

  try {
    const port = await getContainerPort(instance.container_id)
    const moltbotWsUrl = `ws://localhost:${port}/ws`

    const moltbotWs = new WebSocket(moltbotWsUrl)
    client.moltbotWs = moltbotWs

    moltbotWs.on('open', () => {
      console.log(`Connected to Moltbot for instance: ${client.instanceId}`)
    })

    moltbotWs.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        // Forward response to client
        client.ws.send(JSON.stringify({
          type: 'message',
          id: crypto.randomUUID(),
          role: 'assistant',
          content: message.content,
          timestamp: new Date().toISOString(),
        }))
      } catch (error) {
        console.error('Failed to forward Moltbot message:', error)
      }
    })

    moltbotWs.on('error', (error) => {
      console.error('Moltbot WebSocket error:', error)
      client.ws.send(JSON.stringify({
        type: 'error',
        message: 'Connection to Moltbot failed',
      }))
    })

    moltbotWs.on('close', () => {
      console.log(`Disconnected from Moltbot for instance: ${client.instanceId}`)
    })
  } catch (error) {
    console.error('Failed to connect to Moltbot:', error)
    client.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to connect to Moltbot',
    }))
  }
}
