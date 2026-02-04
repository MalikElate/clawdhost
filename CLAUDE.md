# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ClawdHost** is a self-service portal for managing Moltbot AI assistant instances. Users can create, manage, and interact with Docker containers running Moltbot instances through a web interface.

## Development Commands

### Frontend (React + Vite)
- `npm run dev` - Start Vite dev server (runs on port 5173)
- `npm run build` - Build TypeScript and Vite bundle for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks across the codebase

### Backend (Express.js)
- `npm run dev:server` - Start Express server with hot reload (runs on port 3001)
- `npm run build:server` - Compile TypeScript for backend
- `npm run start` - Run production Express server

### Development Workflow
- `npm run dev:all` - Run frontend and backend simultaneously (recommended for local development)

## Architecture

### Frontend Stack
- **React 19** with TypeScript
- **Vite** for fast builds and HMR
- **React Router** for navigation with routes:
  - `/` - Landing page (unauthenticated)
  - `/sign-in/*` - Clerk authentication
  - `/sign-up/*` - User registration
  - `/dashboard` - User's instance management (protected)
  - `/chat/:instanceId` - Chat interface for running instances (protected)
- **Tailwind CSS v4** for styling via @tailwindcss/vite plugin
- **Clerk** for authentication and user management
- **WebSocket** hook (`useWebSocket`) for real-time communication with instances

**Frontend Structure:**
- `src/pages/` - Page components (Landing, Dashboard, Chat, SignIn, SignUp)
- `src/components/` - Reusable components organized by feature (chat, dashboard, layout)
- `src/hooks/` - Custom hooks (useWebSocket)
- `src/lib/` - Utility functions (API client)

### Backend Stack
- **Express.js** with TypeScript
- **SQLite** (better-sqlite3) for persistent data
- **Clerk** middleware for authentication via JWT
- **Docker API** (dockerode) for container management
- **WebSocket** for real-time instance communication

**Backend Structure:**
- `server/routes/instances.ts` - Express routes for CRUD operations on instances
- `server/services/docker.ts` - Docker container lifecycle management (create, remove, status checks)
- `server/services/websocket.ts` - WebSocket server for real-time updates
- `server/db/sqlite.ts` - Database initialization and query helpers

### Database Schema
The SQLite database has a single `instances` table tracking user-managed containers:
- `id` - UUID primary key
- `user_id` - Clerk user ID (for multi-tenancy)
- `name` - User-friendly instance name
- `status` - State machine: 'creating' → 'running' | 'stopped' | 'error'
- `container_id` - Docker container ID reference
- `created_at`, `updated_at` - Timestamps
- Index on `user_id` for efficient queries

### Data Flow
1. User authenticates via Clerk (frontend → Clerk, Clerk JWT → backend)
2. Frontend makes API calls to `/api/instances/*` (authenticated with Clerk JWT)
3. Backend validates user via Clerk middleware, queries SQLite, coordinates with Docker daemon
4. Docker API manages container lifecycle: pull moltbot/moltbot image, create containers with dynamic port binding (port 3000 → random host port)
5. WebSocket connection established from frontend to backend for real-time instance status and chat messages

### Development Setup
The Vite dev server proxies `/api` requests to `http://localhost:3001` with WebSocket support enabled, so frontend and backend can run independently.

### Infrastructure
- `terraform/` - Infrastructure as Code for Oracle Cloud Free Tier deployment
- Environment variables: `PORT` (backend port, default 3001), `DOCKER_SOCKET` (Docker daemon socket path, defaults to `/var/run/docker.sock`)
- `.env` file required for Clerk API keys and other secrets (see `.env.example`)
