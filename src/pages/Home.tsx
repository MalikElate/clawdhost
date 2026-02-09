import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import PublicHeader from '../components/layout/PublicHeader'
import ChatWindow from '../components/chat/ChatWindow'

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
    try {
      const res = await fetch('/api/instances')
      if (res.ok) {
        const data = await res.json()
        setInstances(data)
      }
    } catch (error) {
      console.error('Failed to fetch instances:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl h-full">
          {isSignedIn && hasBetaAccess && hasInstance && activeInstance ? (
            // User has beta access and an instance - show chat
            <ChatWindow instanceId={activeInstance.id} />
          ) : (
            // Show access request message
            <div className="h-full flex items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="text-center max-w-md">
                <div className="text-4xl mb-4">🌻</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  SunnyBot
                </h2>
                <p className="text-slate-300 mb-6">
                  {isSignedIn
                    ? 'You don\'t have beta access yet.'
                    : 'Sign in to get started.'}
                </p>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mb-6">
                  <p className="text-slate-400 mb-4">
                    To request beta access, reach out to us:
                  </p>
                  <div className="space-y-3">
                    <a
                      href="https://www.tiktok.com/@malikelate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition"
                    >
                      📱 DM @malikelate on TikTok
                    </a>
                    <a
                      href="mailto:pluto-software.chirping353@passinbox.com"
                      className="block bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition"
                    >
                      📧 Email us
                    </a>
                  </div>
                </div>
                {!isSignedIn && (
                  <p className="text-slate-500 text-sm">
                    Already have access? Sign in above
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
