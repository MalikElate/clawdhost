import { useState, useRef, useEffect } from 'react'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`
    }
  }, [message])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || disabled) return

    onSend(message.trim())
    setMessage('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-700/50 p-4 flex gap-2"
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Connecting...' : 'Type a message...'}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-lg bg-slate-700 border border-slate-600 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  )
}
