import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import { PostHogProvider } from '@posthog/react'
import './index.css'
import App from './App'
import PostHogIdentify from './components/PostHogIdentify'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

if (!CONVEX_URL) {
  throw new Error('Missing VITE_CONVEX_URL')
}

const convex = new ConvexReactClient(CONVEX_URL)

const posthogOptions = {
  api_host: POSTHOG_HOST,
  defaults: '2026-01-30',
} as const

function AppTree() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <PostHogIdentify />
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {POSTHOG_KEY ? (
      <PostHogProvider apiKey={POSTHOG_KEY} options={posthogOptions}>
        <AppTree />
      </PostHogProvider>
    ) : (
      <AppTree />
    )}
  </StrictMode>,
)
