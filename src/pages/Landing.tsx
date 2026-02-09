import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950">
      {/* Header */}
      <header className="border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌻</span>
              <span className="text-xl font-bold text-white">SunnyBot</span>
            </div>
            <nav className="flex items-center gap-4">
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-500 transition"
                >
                  Get Started
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  to="/dashboard"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-500 transition"
                >
                  Dashboard
                </Link>
                <UserButton />
              </SignedIn>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
            deploy moltbot to a{' '}
            <span className="text-brand-400">vpc</span>
          </h1>
          <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto">
            Deploy your personal Moltbot AI assistant in seconds.
            No server management. No complex setup. Just pure AI power.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <SignedOut>
              <Link
                to="/sign-up"
                className="rounded-lg bg-brand-600 px-8 py-3 text-lg font-semibold text-white hover:bg-brand-500 transition"
              >
                Start Free
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
              href="https://docs.molt.bot"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-600 px-8 py-3 text-lg font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white">Instant Deploy</h3>
            <p className="mt-2 text-slate-400">
              Spin up your personal Moltbot instance with one click. Ready in under 60 seconds.
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white">Chat Interface</h3>
            <p className="mt-2 text-slate-400">
              Built-in WebSocket chat to interact with your AI assistant in real-time.
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-6 border border-slate-700/50">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-white">Your Data</h3>
            <p className="mt-2 text-slate-400">
              Each instance is isolated. Your conversations stay private and secure.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500">
            © 2026 SunnyBot. Powered by Moltbot.
          </p>
        </div>
      </footer>
    </div>
  )
}
