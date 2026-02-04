import { UserButton } from '@clerk/clerk-react'

export default function Header() {
  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium text-white">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            },
          }}
        />
      </div>
    </header>
  )
}
