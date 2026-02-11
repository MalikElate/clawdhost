import { Link } from 'react-router-dom'

interface Instance {
  id: string
  name: string
  status: 'running' | 'stopped' | 'creating' | 'error'
  serviceUrl?: string
  createdAt: number
}

interface InstanceCardProps {
  instance: Instance
  onDelete: () => void
}

const statusColors = {
  running: 'bg-green-500',
  stopped: 'bg-slate-500',
  creating: 'bg-yellow-500',
  error: 'bg-red-500',
}

const statusLabels = {
  running: 'Running',
  stopped: 'Stopped',
  creating: 'Creating...',
  error: 'Error',
}

export default function InstanceCard({ instance, onDelete }: InstanceCardProps) {
  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{instance.name}</h3>
          <p className="text-sm text-slate-500">
            Created {new Date(instance.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${statusColors[instance.status]}`}
          />
          <span className="text-sm text-slate-400">
            {statusLabels[instance.status]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {instance.status === 'running' && (
          <Link
            to={`/chat/${instance.id}`}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-center text-white hover:bg-brand-500 transition"
          >
            Open Chat
          </Link>
        )}
        {instance.status === 'creating' && (
          <div className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-center text-slate-400 cursor-not-allowed">
            Starting...
          </div>
        )}
        {instance.status === 'stopped' && (
          <button className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-500 transition">
            Start
          </button>
        )}
        <button
          onClick={onDelete}
          className="rounded-lg border border-red-600/50 px-4 py-2 text-red-400 hover:bg-red-600/20 transition"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
