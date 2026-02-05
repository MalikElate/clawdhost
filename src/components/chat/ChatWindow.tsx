import { useWebSocket } from '../../hooks/useWebSocket'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

interface ChatWindowProps {
  instanceId: string
}

export default function ChatWindow({ instanceId }: ChatWindowProps) {
  const { messages, isConnected, isConnecting, sendMessage } = useWebSocket({
    instanceId,
  })

  return (
    <div className="flex-1 flex flex-col rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
      {/* Connection Status */}
      <div className="px-4 py-2 border-b border-slate-700/50 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isConnecting
              ? 'bg-yellow-500 animate-pulse'
              : isConnected
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}
        />
        <span className="text-sm text-slate-400">
          {isConnecting
            ? 'Connecting...'
            : isConnected
            ? 'Connected'
            : 'Disconnected'}
        </span>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <MessageInput onSend={sendMessage} disabled={!isConnected} />
    </div>
  )
}
