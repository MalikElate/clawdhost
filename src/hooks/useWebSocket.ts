import { useState, useEffect, useRef, useCallback } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UseWebSocketOptions {
  instanceId: string
}

export function useWebSocket({ instanceId }: UseWebSocketOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Build WebSocket URL based on environment
    const getWebSocketUrl = (id: string): string => {
      const apiUrl = import.meta.env.VITE_API_URL
      if (apiUrl) {
        // Production: use configured backend URL
        const url = new URL(apiUrl)
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
        return `${protocol}//${url.host}/api/ws/${id}`
      }
      // Development: use same-origin connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${protocol}//${window.location.host}/api/ws/${id}`
    }

    const wsUrl = getWebSocketUrl(instanceId)

    setIsConnecting(true)
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setIsConnecting(false)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'message') {
          const message: Message = {
            id: data.id || crypto.randomUUID(),
            role: data.role,
            content: data.content,
            timestamp: new Date(data.timestamp || Date.now()),
          }
          setMessages((prev) => [...prev, message])
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      setIsConnecting(false)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
      setIsConnecting(false)
    }

    return () => {
      ws.close()
    }
  }, [instanceId])

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected')
      return
    }

    const message: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, message])
    wsRef.current.send(JSON.stringify({ type: 'message', content }))
  }, [])

  return {
    messages,
    isConnected,
    isConnecting,
    sendMessage,
  }
}
