import { SignUp as ClerkSignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 flex flex-col">
      <header className="border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🦞</span>
              <span className="text-xl font-bold text-white">ClawdHost</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
        />
      </main>
    </div>
  )
}
