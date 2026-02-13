import { useState } from 'react'

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, type: 'todo') => void
}

export default function CreateAppModal({ isOpen, onClose, onCreate }: CreateAppModalProps) {
  const [name, setName] = useState('My Tasks')
  const [isCreating, setIsCreating] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setIsCreating(true)
    await onCreate(name.trim(), 'todo')
    setIsCreating(false)
    setName('My Tasks')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 rounded-xl border border-slate-700/50 p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Create New App</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="app-name" className="block text-sm font-medium text-slate-300 mb-2">
              App Name
            </label>
            <input
              type="text"
              id="app-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Tasks"
              className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">App Type</label>
            <div className="rounded-lg bg-slate-700 border border-brand-500 px-4 py-3 flex items-center gap-3">
              <span className="text-xl">📋</span>
              <div>
                <p className="text-white font-medium">Todo / Kanban</p>
                <p className="text-xs text-slate-400">Organize tasks in Backlog, In Progress, and Done columns</p>
              </div>
            </div>
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
