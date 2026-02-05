import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

export default function PublicHeader() {
  return (
    <header className="border-b border-slate-700/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">🦞</span>
            <span className="text-xl font-bold text-white">ClawdHost</span>
          </Link>
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
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  )
}
