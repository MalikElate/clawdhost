import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: 'Instances', icon: '🖥️' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700/50 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌻</span>
          <span className="text-xl font-bold text-white">SunnyBot</span>
        </Link>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
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
  )
}
