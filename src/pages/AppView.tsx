import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import KanbanColumn from '../components/apps/KanbanColumn'
import AddItemForm from '../components/apps/AddItemForm'
import CreateAppModal from '../components/apps/CreateAppModal'

type TodoStatus = 'backlog' | 'in_progress' | 'done'

const columns: Array<{ status: TodoStatus; title: string }> = [
  { status: 'backlog', title: 'Backlog' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
]

export default function AppView() {
  const { appId } = useParams<{ appId: string }>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [createAppModalOpen, setCreateAppModalOpen] = useState(false)

  const app = useQuery(api.apps.get, appId ? { appId: appId as any } : 'skip')
  const items = useQuery(api.apps.listItems, appId ? { appId: appId as any } : 'skip')

  const createItem = useMutation(api.apps.createItem)
  const updateItem = useMutation(api.apps.updateItem)
  const deleteItem = useMutation(api.apps.deleteItem)
  const createApp = useMutation(api.apps.create)

  async function handleAddItem(title: string) {
    if (!appId) return
    await createItem({ appId: appId as any, title })
    setShowAddForm(false)
  }

  async function handleMoveItem(itemId: string, newStatus: TodoStatus) {
    await updateItem({ itemId: itemId as any, status: newStatus })
  }

  async function handleDeleteItem(itemId: string) {
    await deleteItem({ itemId: itemId as any })
  }

  async function handleCreateApp(name: string, type: 'todo') {
    await createApp({ name, type })
    setCreateAppModalOpen(false)
  }

  if (!appId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">App not found</p>
          <Link to="/dashboard" className="text-brand-400 hover:text-brand-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateApp={() => setCreateAppModalOpen(true)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl">📋</span>
            <h1 className="text-2xl font-bold text-white">
              {app?.name ?? 'Loading...'}
            </h1>
          </div>

          {items === undefined ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {columns.map((col) => (
                  <KanbanColumn
                    key={col.status}
                    title={col.title}
                    status={col.status}
                    items={(items ?? []).filter((i) => i.status === col.status)}
                    onMoveItem={handleMoveItem}
                    onDeleteItem={handleDeleteItem}
                    onAddItem={col.status === 'backlog' ? () => setShowAddForm(true) : undefined}
                  />
                ))}
              </div>

              {showAddForm && (
                <div className="mt-4 max-w-sm">
                  <AddItemForm
                    onAdd={handleAddItem}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <CreateAppModal
        isOpen={createAppModalOpen}
        onClose={() => setCreateAppModalOpen(false)}
        onCreate={handleCreateApp}
      />
    </div>
  )
}
