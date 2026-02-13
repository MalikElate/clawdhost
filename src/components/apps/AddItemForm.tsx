import { useState } from 'react'

interface AddItemFormProps {
  onAdd: (title: string) => void
  onCancel: () => void
}

export default function AddItemForm({ onAdd, onCancel }: AddItemFormProps) {
  const [title, setTitle] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-slate-700/50 border border-slate-600/50 p-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        autoFocus
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="text-xs px-3 py-1 rounded bg-brand-600 text-white hover:bg-brand-500 transition disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs px-3 py-1 rounded text-slate-400 hover:text-white transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
