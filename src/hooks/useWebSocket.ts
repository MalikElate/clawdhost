import { useState, useEffect, useRef, useCallback } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface UseWebSocketOptions {
  instanceId: string
  serviceUrl: string
  gatewayToken?: string
}

const SESSION_KEY = 'main'
const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECT_ATTEMPTS = 10

export function useWebSocket({ instanceId, serviceUrl, gatewayToken }: UseWebSocketOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const connectedRef = useRef(false)
  const reconnectAttempts = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intentionalClose = useRef(false)

  const connect = useCallback(() => {
    const wsUrl = serviceUrl.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')

    setIsConnecting(true)
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      reconnectAttempts.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Handle connect.challenge — respond with connect RPC
        if (data.type === 'event' && data.event === 'connect.challenge') {
          ws.send(JSON.stringify({
            type: 'req',
            id: crypto.randomUUID(),
            method: 'connect',
            params: {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: 'webchat',
                version: '1.0.0',
                platform: navigator.platform || 'web',
                mode: 'cli',
              },
              auth: gatewayToken ? { token: gatewayToken } : {},
              role: 'operator',
              scopes: ['operator.admin'],
              caps: [],
            },
          }))
          return
        }

        // Handle connect response (hello-ok) — fetch history then mark connected
        if (data.type === 'res' && data.ok && data.payload?.type === 'hello-ok') {
          // Fetch chat history via sessions.preview (chat.history doesn't persist webchat messages)
          ws.send(JSON.stringify({
            type: 'req',
            id: '__history__',
            method: 'sessions.preview',
            params: { keys: [SESSION_KEY] },
          }))
          connectedRef.current = true
          setIsConnected(true)
          setIsConnecting(false)
          return
        }

        // Handle history response from sessions.preview
        if (data.type === 'res' && data.id === '__history__' && data.ok) {
          const preview = data.payload?.previews?.[0]
          if (preview?.status === 'ok' && preview.items) {
            const historyMessages: Message[] = preview.items
              .filter((m: any) => m.role === 'user' || m.role === 'assistant')
              .map((m: any) => ({
                id: crypto.randomUUID(),
                role: m.role as 'user' | 'assistant',
                content: (m.text ?? '').replace(/\n\[message_id: [^\]]+\]$/, ''),
                timestamp: new Date(),
              }))
              .filter((m: Message) => m.content.length > 0)

            if (historyMessages.length > 0) {
              setMessages((prev) => {
                // Don't duplicate if we already have messages (e.g. reconnect)
                if (prev.length > 0) return prev
                return historyMessages
              })
            }
          }
          return
        }

        // Handle connect failure
        if (data.type === 'res' && data.ok === false && data.id !== '__history__') {
          console.error('Gateway error:', data.error?.message)
          setIsConnecting(false)
          return
        }

        // Handle chat events from ANY session (including cron notifications)
        if (data.type === 'event' && data.event === 'chat') {
          const payload = data.payload
          if (!payload) return

          if (payload.state === 'delta') {
            const text = payload.message?.content
              ?.filter((c: any) => c.type === 'text')
              .map((c: any) => c.text)
              .join('') ?? ''

            setMessages((prev) => {
              const existing = prev.find((m) => m.id === payload.runId && m.role === 'assistant')
              if (existing) {
                return prev.map((m) =>
                  m.id === payload.runId && m.role === 'assistant'
                    ? { ...m, content: text }
                    : m
                )
              }
              return [
                ...prev,
                {
                  id: payload.runId,
                  role: 'assistant',
                  content: text,
                  timestamp: new Date(),
                },
              ]
            })
          } else if (payload.state === 'final') {
            const text = payload.message?.content
              ?.filter((c: any) => c.type === 'text')
              .map((c: any) => c.text)
              .join('') ?? ''

            setMessages((prev) => {
              const existing = prev.find((m) => m.id === payload.runId && m.role === 'assistant')
              if (existing) {
                return prev.map((m) =>
                  m.id === payload.runId && m.role === 'assistant'
                    ? { ...m, content: text }
                    : m
                )
              }
              return [
                ...prev,
                {
                  id: payload.runId,
                  role: 'assistant',
                  content: text,
                  timestamp: new Date(payload.message?.timestamp || Date.now()),
                },
              ]
            })
          } else if (payload.state === 'error') {
            setMessages((prev) => [
              ...prev,
              {
                id: payload.runId || crypto.randomUUID(),
                role: 'assistant',
                content: `Error: ${payload.errorMessage || 'Something went wrong'}`,
                timestamp: new Date(),
              },
            ])
          }
          return
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      connectedRef.current = false
      setIsConnected(false)
      setIsConnecting(false)

      // Auto-reconnect unless intentionally closed
      if (!intentionalClose.current && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current++
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS)
      }
    }

    ws.onerror = () => {
      connectedRef.current = false
      setIsConnected(false)
      setIsConnecting(false)
    }
  }, [serviceUrl, gatewayToken])

  useEffect(() => {
    intentionalClose.current = false
    connect()

    return () => {
      intentionalClose.current = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [instanceId, connect])

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !connectedRef.current) {
      console.error('WebSocket is not connected')
      return
    }

    const idempotencyKey = crypto.randomUUID()

    const message: Message = {
      id: idempotencyKey,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])

    wsRef.current.send(
      JSON.stringify({
        type: 'req',
        id: crypto.randomUUID(),
        method: 'chat.send',
        params: {
          sessionKey: SESSION_KEY,
          message: content,
          idempotencyKey,
        },
      })
    )
  }, [])

  return {
    messages,
    isConnected,
    isConnecting,
    sendMessage,
  }
}
