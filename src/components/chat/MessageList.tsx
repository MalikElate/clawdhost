import { useEffect, useRef } from 'react'
import type { Message } from '../../hooks/useWebSocket'

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🌻</div>
          <p className="text-slate-400">
            Start a conversation with your Moltbot!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-700 text-slate-100'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p
              className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-brand-200' : 'text-slate-500'
              }`}
            >
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
