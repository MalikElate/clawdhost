import { useState, useRef, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  requireAuth?: boolean
  requireBeta?: boolean
}

export default function MessageInput({
  onSend,
  disabled,
  requireAuth = false,
  requireBeta = false,
}: MessageInputProps) {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [showBetaNotice, setShowBetaNotice] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasBetaAccess = user?.publicMetadata?.beta_access === true

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

    // Check authentication requirement
    if (requireAuth && !isSignedIn) {
      navigate('/sign-in')
      return
    }

    // Check beta access requirement
    if (requireBeta && !hasBetaAccess) {
      setShowBetaNotice(true)
      setTimeout(() => setShowBetaNotice(false), 5000)
      return
    }

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
      className="border-t border-slate-700/50 p-4 flex flex-col gap-2"
    >
      {showBetaNotice && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-300 text-sm">
          Beta access required. Contact pluto-software.chirping353@passinbox.com
        </div>
      )}
      <div className="flex gap-2">
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
          className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-500 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Send
        </button>
      </div>
    </form>
  )
}
