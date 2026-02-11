import { useUser, useAuth, SignedIn, SignedOut } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { Link } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import PublicHeader from '../components/layout/PublicHeader'
import ChatWindow from '../components/chat/ChatWindow'

export default function Home() {
  const { isSignedIn, user } = useUser()
  const { isLoaded } = useAuth()

  const hasBetaAccess = user?.publicMetadata?.beta_access === true

  const instances = useQuery(
    api.instances.list,
    isSignedIn && isLoaded ? {} : "skip"
  )

  const activeInstance = instances?.[0]

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <PublicHeader />

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-6xl">🌻</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Deploy OpenClaw to Your Own VPS
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            SunnyBot makes it easy to securely deploy and manage{' '}
            <a
              href="https://openclaw.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 underline"
            >
              OpenClaw
            </a>{' '}
            AI on managed infrastructure. Your data, your instance, your control.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <SignedOut>
              <Link
                to="/sign-up"
                className="rounded-lg bg-brand-600 px-8 py-3 text-lg font-semibold text-white hover:bg-brand-500 transition"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                className="rounded-lg bg-brand-600 px-8 py-3 text-lg font-semibold text-white hover:bg-brand-500 transition"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <a
              href="https://openclaw.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-600 px-8 py-3 text-lg font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition"
            >
              Learn about OpenClaw
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-8">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Deployment</h3>
            <p className="text-slate-400">
              Each instance runs in its own isolated environment on a dedicated VPS. Your data never leaves your server.
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-8">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-white mb-2">One-Click Setup</h3>
            <p className="text-slate-400">
              Deploy a fully configured OpenClaw instance in seconds. No DevOps experience required.
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-8">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-white mb-2">Built-in Chat</h3>
            <p className="text-slate-400">
              Real-time WebSocket chat interface to interact with your deployed OpenClaw instance right from your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Project Links */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Explore the Projects</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <a
              href="https://openclaw.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 hover:border-brand-500/50 transition"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition">
                OpenClaw &rarr;
              </h3>
              <p className="mt-2 text-slate-400">
                The open-source AI chatbot that SunnyBot deploys. Learn more at openclaw.ai.
              </p>
            </a>
            <a
              href="https://github.com/MalikElate/clawdhost"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 hover:border-brand-500/50 transition"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition">
                SunnyBot on GitHub &rarr;
              </h3>
              <p className="mt-2 text-slate-400">
                View the source code, contribute, or self-host your own SunnyBot deployment.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Chat section for beta users with running instances */}
      {isSignedIn && hasBetaAccess && activeInstance?.serviceUrl && (
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-xl font-semibold text-white mb-4">Your Instance</h2>
            <ChatWindow instanceId={activeInstance.id} serviceUrl={activeInstance.serviceUrl} gatewayToken={activeInstance.gatewayToken} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-700/50 py-8">
        <p className="text-center text-sm text-slate-500">
          Powered by{' '}
          <a href="https://openclaw.ai/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition">
            OpenClaw
          </a>
          . Built with SunnyBot.
        </p>
      </footer>
    </div>
  )
}
