import PublicHeader from '../components/layout/PublicHeader'

const roadmapItems = [
  {
    title: 'Chatbot interface',
    description: 'Built-in real-time chat to interact with your deployed OpenClaw instance.',
    icon: '💬',
    status: 'done' as const,
    statusLabel: 'Shipped',
  },
  {
    title: 'Easy self-hosting option',
    description: 'Deploy OpenClaw to your own infrastructure with a simple setup process.',
    icon: '🏠',
    status: 'in-progress' as const,
    statusLabel: 'In Progress',
  },
  {
    title: 'Mobile app',
    description: 'Manage and chat with your OpenClaw instances from your phone.',
    icon: '📱',
    status: 'planned' as const,
    statusLabel: 'Planned',
  },
  {
    title: 'Easy setup for connecting other apps',
    description: 'Connect OpenClaw to your favorite tools and services with simple integrations.',
    icon: '🔌',
    status: 'planned' as const,
    statusLabel: 'Planned',
  },
  {
    title: 'Deploy to Mac VPS',
    description: 'Run OpenClaw on macOS virtual private servers for native performance.',
    icon: '🍎',
    status: 'planned' as const,
    statusLabel: 'Planned',
  },
  {
    title: 'Use SunnyBot as a backend for other agent projects',
    description: 'API access to use SunnyBot infrastructure for powering your own AI agent projects.',
    icon: '🤖',
    status: 'planned' as const,
    statusLabel: 'Planned',
  },
]

const statusStyles = {
  'done': {
    node: 'border-green-500 bg-green-500/20',
    badge: 'bg-green-500/20 text-green-400',
  },
  'in-progress': {
    node: 'border-brand-400 bg-brand-400/10 animate-pulse',
    badge: 'bg-brand-500/20 text-brand-400',
  },
  'planned': {
    node: 'border-slate-600 bg-slate-800',
    badge: 'bg-slate-700 text-slate-400',
  },
}

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Roadmap</h1>
          <p className="mt-4 text-lg text-slate-400">What we're building next</p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />

          {roadmapItems.map((item, index) => {
            const styles = statusStyles[item.status]
            return (
              <div key={index} className="relative flex items-start gap-6 pb-12 last:pb-0">
                {/* Node circle */}
                <div
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${styles.node}`}
                >
                  <span className="text-lg">{item.icon}</span>
                </div>

                {/* Content card */}
                <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                      {item.statusLabel}
                    </span>
                  </div>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </main>

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
