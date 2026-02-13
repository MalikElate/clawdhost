import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

const navItems = [
  { path: '/dashboard', label: 'Instances', icon: '🖥️' },
]

const appTypeIcons: Record<string, string> = {
  todo: '📋',
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onCreateApp?: () => void
}

export default function Sidebar({ isOpen, onClose, onCreateApp }: SidebarProps) {
  const location = useLocation()
  const apps = useQuery(api.apps.list)

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700/50 flex flex-col
          transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌻</span>
            <span className="text-xl font-bold text-white">SunnyBot</span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white transition"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    location.pathname === item.path
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Apps section */}
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Apps
              </span>
              {onCreateApp && (
                <button
                  onClick={onCreateApp}
                  className="text-slate-500 hover:text-brand-400 transition text-lg leading-none"
                  title="New App"
                >
                  +
                </button>
              )}
            </div>
            <ul className="space-y-1">
              {apps?.map((app) => (
                <li key={app.id}>
                  <Link
                    to={`/apps/${app.id}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm ${
                      location.pathname === `/apps/${app.id}`
                        ? 'bg-brand-600/20 text-brand-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>{appTypeIcons[app.type] ?? '📦'}</span>
                    <span className="truncate">{app.name}</span>
                  </Link>
                </li>
              ))}
              {apps !== undefined && apps.length === 0 && (
                <li className="px-3 py-2 text-xs text-slate-600">
                  No apps yet
                </li>
              )}
            </ul>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <a
            href="https://docs.molt.bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition"
          >
            <span>📚</span>
            <span>Documentation</span>
          </a>
        </div>
      </aside>
    </>
  )
}
