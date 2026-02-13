interface TodoItem {
  id: string
  title: string
  description?: string
  status: 'backlog' | 'in_progress' | 'done'
  order: number
  createdAt: number
}

type TodoStatus = 'backlog' | 'in_progress' | 'done'

interface KanbanColumnProps {
  title: string
  status: TodoStatus
  items: TodoItem[]
  onMoveItem: (itemId: string, newStatus: TodoStatus) => void
  onDeleteItem: (itemId: string) => void
  onAddItem?: () => void
}

const columnColors: Record<TodoStatus, string> = {
  backlog: 'border-slate-500',
  in_progress: 'border-brand-500',
  done: 'border-green-500',
}

const moveTargets: Record<TodoStatus, Array<{ status: TodoStatus; label: string }>> = {
  backlog: [{ status: 'in_progress', label: 'Start →' }],
  in_progress: [
    { status: 'backlog', label: '← Back' },
    { status: 'done', label: 'Done ✓' },
  ],
  done: [{ status: 'in_progress', label: '← Reopen' }],
}

export default function KanbanColumn({
  title,
  status,
  items,
  onMoveItem,
  onDeleteItem,
  onAddItem,
}: KanbanColumnProps) {
  const sorted = [...items].sort((a, b) => a.order - b.order)

  return (
    <div className="flex-1 min-w-[280px]">
      <div className={`rounded-xl bg-slate-800/50 border-t-2 ${columnColors[status]} border border-slate-700/50 p-4 min-h-[300px]`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            {title}
            <span className="ml-2 text-slate-500 font-normal">{items.length}</span>
          </h3>
          {onAddItem && (
            <button
              onClick={onAddItem}
              className="text-slate-500 hover:text-brand-400 transition text-lg leading-none"
              title="Add task"
            >
              +
            </button>
          )}
        </div>
        <div className="space-y-3">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-slate-700/50 border border-slate-600/50 p-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-white font-medium">{item.title}</p>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-xs shrink-0"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
              {item.description && (
                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                {moveTargets[status].map((target) => (
                  <button
                    key={target.status}
                    onClick={() => onMoveItem(item.id, target.status)}
                    className="text-xs px-2 py-1 rounded bg-slate-600/50 text-slate-300 hover:bg-slate-600 hover:text-white transition"
                  >
                    {target.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">
              No tasks
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
