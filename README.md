# SunnyBot

**Deploy OpenClaw to a VPS**

SunnyBot is a self-service portal for securely deploying and managing [OpenClaw](https://openclaw.ai/) AI instances. Create your own isolated OpenClaw instance on managed infrastructure, manage it from a dashboard, and chat with your AI in real-time.

## Features

- **Secure Deployment** - Each instance runs in its own isolated environment on a dedicated VPS
- **Real-time Chat** - Built-in WebSocket chat interface for seamless interaction
- **One-Click Setup** - Deploy a fully configured OpenClaw instance in seconds
- **Easy Management** - Dashboard to create, monitor, and delete instances
- **Authentication** - Powered by [Clerk](https://clerk.com/) for secure auth

## Beta Access

SunnyBot is currently in **beta**. New users cannot deploy instances by default.

**To request beta access, contact:** `pluto-software.chirping353@passinbox.com`

## Quick Start

### Prerequisites

- **Node.js 22+**
- A [Clerk account](https://dashboard.clerk.com/) (free)
- A [Convex account](https://convex.dev/) (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MalikElate/clawdhost.git
   cd clawdhost
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Clerk and Convex keys
   ```

4. **Start the app**
   ```bash
   npm run dev
   ```
   This starts the Vite frontend dev server and Convex backend concurrently.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Auth**: Clerk
- **Backend**: Convex (serverless)
- **Analytics**: PostHog
- **Routing**: React Router

## Development

### Available Commands

```bash
npm run dev          # Run frontend + Convex backend concurrently
npm run dev:frontend # Vite dev server only
npm run dev:convex   # Convex backend dev only
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure

```
sunnybot/
├── src/                    # React frontend
│   ├── pages/              # Home, Dashboard, Chat, Roadmap, Auth pages
│   ├── components/         # UI components (chat, dashboard, layout)
│   └── hooks/              # Custom React hooks (useWebSocket)
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── instances.ts        # Instance management functions
│   └── railway.ts          # Railway deployment integration
├── terraform/              # Infrastructure as Code
└── CLAUDE.md               # Architecture docs
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

**Can't create instances?**
- Check if you have beta access (contact `pluto-software.chirping353@passinbox.com`)
- Ensure your Clerk and Convex keys are configured in `.env`

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check that you're using Node.js 22+: `node --version`

## Links

- [OpenClaw](https://openclaw.ai/) - The AI chatbot SunnyBot deploys
- [SunnyBot on GitHub](https://github.com/MalikElate/clawdhost)

## Support

For questions, issues, or feature requests, contact: `pluto-software.chirping353@passinbox.com`

---

Built with SunnyBot. Powered by [OpenClaw](https://openclaw.ai/).
