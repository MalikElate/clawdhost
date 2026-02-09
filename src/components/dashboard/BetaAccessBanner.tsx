interface BetaAccessBannerProps {
  contactEmail: string
}

export default function BetaAccessBanner({ contactEmail }: BetaAccessBannerProps) {
  return (
    <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-6 mb-6">
      <div className="flex items-start gap-4">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">
            Beta Access Required
          </h2>
          <p className="text-slate-300 mb-4">
            SunnyBot is currently in beta. You don't have access to deploy instances yet.
          </p>
          <p className="text-slate-400 mb-4">
            To request beta access and start deploying your Moltbot instances, contact:
          </p>
          <div className="flex items-center gap-3">
            <code className="bg-slate-900 px-3 py-2 rounded border border-slate-700 text-yellow-300 font-mono">
              {contactEmail}
            </code>
            <a
              href={`mailto:${contactEmail}?subject=SunnyBot Beta Access Request`}
              className="rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-500 transition"
            >
              Send Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
