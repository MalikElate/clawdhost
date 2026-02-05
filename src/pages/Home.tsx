import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import PublicHeader from '../components/layout/PublicHeader'
import ChatWindow from '../components/chat/ChatWindow'
import CreateInstanceModal from '../components/dashboard/CreateInstanceModal'

interface Instance {
  id: string
  name: string
  status: 'running' | 'stopped' | 'creating' | 'error'
  createdAt: string
}

export default function Home() {
  const { isSignedIn, user } = useUser()
  const { isLoaded } = useAuth()
  const [instances, setInstances] = useState<Instance[]>([])
  const [isLoadingInstances, setIsLoadingInstances] = useState(false)
  const [isCreatingInstance, setIsCreatingInstance] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const hasBetaAccess = user?.publicMetadata?.beta_access === true
  const hasInstance = instances.length > 0
  const activeInstance = instances[0]

  // Fetch instances if signed in
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      fetchInstances()
    }
  }, [isSignedIn, isLoaded])

  async function fetchInstances() {
    setIsLoadingInstances(true)
    try {
      const res = await fetch('/api/instances')
      if (res.ok) {
        const data = await res.json()
        setInstances(data)
      }
    } catch (error) {
      console.error('Failed to fetch instances:', error)
    } finally {
      setIsLoadingInstances(false)
    }
  }

  async function handleCreateInstance(name: string) {
    setIsCreatingInstance(true)
    try {
      const res = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const newInstance = await res.json()
        setInstances([newInstance, ...instances])
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Failed to create instance:', error)
    } finally {
      setIsCreatingInstance(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        {/* Show prompt if signed in with beta but no instance */}
        {isSignedIn && hasBetaAccess && !hasInstance && !isLoadingInstances && (
          <div className="bg-blue-500/10 border-b border-blue-500/30 p-4">
            <div className="mx-auto max-w-4xl px-4">
              <p className="text-blue-300 mb-3">
                Welcome! You have beta access. Create an instance to start chatting.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={isCreatingInstance}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingInstance ? 'Creating...' : 'Create Instance'}
              </button>
            </div>
          </div>
        )}

        {/* Chat interface */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl h-full">
            {activeInstance ? (
              <ChatWindow
                instanceId={activeInstance.id}
                requireAuth={false}
                requireBeta={false}
              />
            ) : (
              <div className="h-full flex items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {isSignedIn ? 'Chat with ClawdHost' : 'Try ClawdHost'}
                  </h2>
                  <p className="text-slate-400">
                    {!isSignedIn
                      ? 'Sign in to start chatting with your AI assistant'
                      : !hasBetaAccess
                      ? 'Beta access required. Contact pluto-software.chirping353@passinbox.com'
                      : isLoadingInstances
                      ? 'Loading your instances...'
                      : 'Create an instance to get started'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateInstanceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateInstance}
      />
    </div>
  )
}
