import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import InstanceCard from '../components/dashboard/InstanceCard'
import CreateInstanceModal from '../components/dashboard/CreateInstanceModal'
import BetaAccessBanner from '../components/dashboard/BetaAccessBanner'
import { useState } from 'react'

const BETA_CONTACT_EMAIL = 'pluto-software.chirping353@passinbox.com'

export default function Dashboard() {
  const { user } = useUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const hasBetaAccess = user?.publicMetadata?.beta_access === true

  const instances = useQuery(api.instances.list)
  const createInstance = useMutation(api.instances.create)
  const removeInstance = useMutation(api.instances.remove)

  async function handleCreateInstance(name: string) {
    try {
      await createInstance({ name })
    } catch (error) {
      console.error('Failed to create instance:', error)
    }
    setIsModalOpen(false)
  }

  async function handleDeleteInstance(id: string) {
    try {
      await removeInstance({ instanceId: id as any })
    } catch (error) {
      console.error('Failed to delete instance:', error)
    }
  }

  const isLoading = instances === undefined

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6">
          {!hasBetaAccess && (
            <BetaAccessBanner contactEmail={BETA_CONTACT_EMAIL} />
          )}

          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-white">Your Instances</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!hasBetaAccess}
              className={`rounded-lg px-4 py-2 text-white flex items-center gap-2 transition ${
                hasBetaAccess
                  ? 'bg-brand-600 hover:bg-brand-500'
                  : 'bg-slate-600 cursor-not-allowed opacity-50'
              }`}
              title={hasBetaAccess ? undefined : 'Beta access required'}
            >
              <span>+</span>
              <span>New Instance</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : !hasBetaAccess ? (
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-12 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Beta Access Required
              </h2>
              <p className="text-slate-400 mb-6">
                You don't have access to create instances yet. Please contact the team to request beta access.
              </p>
              <a
                href={`mailto:${BETA_CONTACT_EMAIL}?subject=SunnyBot Beta Access Request`}
                className="rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-500 transition inline-block"
              >
                Request Access
              </a>
            </div>
          ) : instances.length === 0 ? (
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-12 text-center">
              <div className="text-4xl mb-4">🌻</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No instances yet
              </h2>
              <p className="text-slate-400 mb-6">
                Create your first Moltbot instance to get started.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-500 transition"
              >
                Create Instance
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {instances.map((instance) => (
                <InstanceCard
                  key={instance.id}
                  instance={instance}
                  onDelete={() => handleDeleteInstance(instance.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <CreateInstanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateInstance}
      />
    </div>
  )
}
