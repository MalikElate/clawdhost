import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import ChatWindow from '../components/chat/ChatWindow'

export default function Chat() {
  const { instanceId } = useParams<{ instanceId: string }>()
  const instance = useQuery(
    api.instances.getStatus,
    instanceId ? { instanceId: instanceId as any } : "skip"
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!instanceId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Instance not found</p>
          <Link
            to="/dashboard"
            className="text-brand-400 hover:text-brand-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 flex flex-col p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-white transition"
            >
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-white">
              Chat with {instance?.name ?? 'Instance'}
            </h1>
          </div>
          {instance?.serviceUrl ? (
            <ChatWindow instanceId={instanceId} serviceUrl={instance.serviceUrl} gatewayToken={instance.gatewayToken} />
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-slate-400">
                {instance === undefined ? 'Loading...' : 'Instance is not running yet.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
