import { useState, useEffect, useRef, useCallback } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UseWebSocketOptions {
  instanceId: string
  serviceUrl: string
  gatewayToken?: string
}

export function useWebSocket({ instanceId, serviceUrl, gatewayToken }: UseWebSocketOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const connectedRef = useRef(false)

  useEffect(() => {
    // Connect to the root path (moltbot gateway serves WebSocket at /)
    const wsUrl = serviceUrl.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')

    setIsConnecting(true)
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      // Don't set connected yet — wait for the connect handshake to complete
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Handle connect.challenge — respond with connect RPC
        if (data.type === 'event' && data.event === 'connect.challenge') {
          const connectReq = {
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
          }
          ws.send(JSON.stringify(connectReq))
          return
        }

        // Handle connect response (hello-ok)
        if (data.type === 'res' && data.ok && data.payload?.type === 'hello-ok') {
          connectedRef.current = true
          setIsConnected(true)
          setIsConnecting(false)
          return
        }

        // Handle connect failure
        if (data.type === 'res' && data.ok === false) {
          console.error('Gateway connect failed:', data.error?.message)
          setIsConnecting(false)
          return
        }

        // Handle chat events (streaming responses)
        if (data.type === 'event' && data.event === 'chat') {
          const payload = data.payload
          if (!payload) return

          if (payload.state === 'delta') {
            // Streaming delta — payload contains full text so far (not incremental)
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
            // Final message — replace with complete content
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

        // Ignore tick events and other events silently
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      connectedRef.current = false
      setIsConnected(false)
      setIsConnecting(false)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      connectedRef.current = false
      setIsConnected(false)
      setIsConnecting(false)
    }

    return () => {
      ws.close()
    }
  }, [instanceId, serviceUrl, gatewayToken])

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !connectedRef.current) {
      console.error('WebSocket is not connected')
      return
    }

    const idempotencyKey = crypto.randomUUID()

    // Add user message to the list
    const message: Message = {
      id: idempotencyKey,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])

    // Send chat.send RPC
    wsRef.current.send(
      JSON.stringify({
        type: 'req',
        id: crypto.randomUUID(),
        method: 'chat.send',
        params: {
          sessionKey: 'default',
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
