import { useWebSocket } from '../../hooks/useWebSocket'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

interface ChatWindowProps {
  instanceId: string
  serviceUrl: string
  gatewayToken?: string
}

export default function ChatWindow({ instanceId, serviceUrl, gatewayToken }: ChatWindowProps) {
  const { messages, isConnected, isConnecting, sendMessage } = useWebSocket({
    instanceId,
    serviceUrl,
    gatewayToken,
  })

  return (
    <div className="flex-1 flex flex-col rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
      {/* Connection status */}
      <div className="px-4 py-2 border-b border-slate-700/50 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected
              ? 'bg-green-500'
              : isConnecting
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-red-500'
          }`}
        />
        <span className="text-sm text-slate-400">
          {isConnected
            ? 'Connected'
            : isConnecting
              ? 'Connecting...'
              : 'Disconnected'}
        </span>
      </div>

      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} disabled={!isConnected} />
    </div>
  )
}
