import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-slate-700/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">🌻</span>
            <span className="text-xl font-bold text-white">SunnyBot</span>
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-400">Beta</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-4">
            <Link
              to="/roadmap"
              className="text-slate-300 hover:text-white transition"
            >
              Roadmap
            </Link>
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
                Deploy Your Bot
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-500 transition"
              >
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
            </SignedIn>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-slate-400 hover:text-white transition"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <nav className="sm:hidden pb-4 space-y-2">
            <Link
              to="/roadmap"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-slate-300 hover:text-white transition"
            >
              Roadmap
            </Link>
            <SignedOut>
              <Link
                to="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition text-center"
              >
                Deploy Your Bot
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition text-center"
              >
                Dashboard
              </Link>
              <div className="px-3 py-2">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8',
                    },
                  }}
                />
              </div>
            </SignedIn>
          </nav>
        )}
      </div>
    </header>
  )
}
