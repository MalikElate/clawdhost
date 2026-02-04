import { useParams, Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import ChatWindow from '../components/chat/ChatWindow'

export default function Chat() {
  const { instanceId } = useParams<{ instanceId: string }>()

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
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col p-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-white transition"
            >
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-white">
              Chat with Instance
            </h1>
          </div>
          <ChatWindow instanceId={instanceId} />
        </main>
      </div>
    </div>
  )
}
