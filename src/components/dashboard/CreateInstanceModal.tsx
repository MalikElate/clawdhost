import { useState, useEffect } from 'react'

interface CreateInstanceModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

const ANIMALS = [
  'bear', 'whale', 'eagle', 'fox', 'wolf', 'hawk', 'lynx', 'orca',
  'puma', 'raven', 'shark', 'tiger', 'viper', 'bison', 'crane',
  'falcon', 'heron', 'otter', 'panther', 'cobra',
]

function generateRandomName(): string {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const number = Math.floor(Math.random() * 900) + 100
  return `${animal}-${number}`
}

export default function CreateInstanceModal({
  isOpen,
  onClose,
  onCreate,
}: CreateInstanceModalProps) {
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(generateRandomName())
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setIsCreating(true)
    await onCreate(name.trim())
    setIsCreating(false)
    setName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-800 rounded-xl border border-slate-700/50 p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">
          Create New Instance
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Instance Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Moltbot"
              className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isCreating}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
