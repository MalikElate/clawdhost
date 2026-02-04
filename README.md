# 🦞 ClawdHost

**Your AI. Your Cloud. Your Claw.**

ClawdHost is a self-service portal for deploying and managing personal [Moltbot](https://molt.bot/) AI assistant instances. Create your own isolated Moltbot container, manage it from a beautiful dashboard, and chat with your AI in real-time.

## ✨ Features

- **🚀 Instant Deploy** - Spin up your personal Moltbot instance in seconds
- **💬 Real-time Chat** - Built-in WebSocket chat interface for seamless interaction
- **🔒 Isolated Instances** - Each user gets their own containerized Moltbot instance
- **📊 Easy Management** - Dashboard to create, monitor, and delete instances
- **🔐 Secure Authentication** - Powered by [Clerk](https://clerk.com/) for safe, passwordless auth
- **☁️ Zero Infrastructure Cost** - Runs on [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)

## ⚠️ Beta Access

ClawdHost is currently in **beta**. New users cannot deploy instances by default.

**To request beta access, contact:** `pluto-software.chirping353@passinbox.com`

Beta access allows you to:
- Create and manage Moltbot instances
- Interact with your AI via the built-in chat interface
- Test the platform before wider release

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** (required)
- **Docker Desktop** (optional, for running containers locally)
- A [Clerk account](https://dashboard.clerk.com/) (free)

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
   # Edit .env and add your Clerk API keys
   ```

4. **Get Clerk API Keys**
   - Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
   - Create a new application named "ClawdHost"
   - Copy your API keys and add them to `.env`:
     ```env
     VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

5. **Start the app**
   ```bash
   npm run dev:all
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## 📖 Documentation

For detailed architecture, development setup, and deployment instructions, see [CLAUDE.md](./CLAUDE.md).

## 🛠️ Development

### Available Commands

**Frontend (React + Vite)**
```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

**Backend (Express + Node.js)**
```bash
npm run dev:server # Start backend with hot reload (port 3001)
npm run build:server # Compile TypeScript
npm run start      # Run production server
```

**Both**
```bash
npm run dev:all    # Run frontend and backend simultaneously
```

### Project Structure

```
clawdhost/
├── src/                    # React frontend
│   ├── pages/             # Landing, Dashboard, Chat, Auth pages
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks (useWebSocket)
│   └── lib/               # Utilities (API client)
├── server/                # Express backend
│   ├── routes/            # API endpoints
│   ├── services/          # Docker & WebSocket services
│   └── db/                # SQLite database
├── terraform/             # Infrastructure as Code
│   └── infra/             # Oracle Cloud configuration
└── CLAUDE.md             # Detailed architecture docs
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

**Can't create instances?**
- Check if you have beta access (contact `pluto-software.chirping353@passinbox.com`)
- Ensure your Clerk keys are configured in `.env`

**WebSocket connection failing?**
- Make sure the backend is running (`npm run dev:server`)
- Check that port 3001 is not in use
- Browser console will show connection errors

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check that you're using Node.js 22+: `node --version`

## 📧 Support

For questions, issues, or feature requests, contact: `pluto-software.chirping353@passinbox.com`

---

Built with 🦞 by the ClawdHost team. Powered by [Moltbot](https://molt.bot/).
