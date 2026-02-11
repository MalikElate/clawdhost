import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import posthog from 'posthog-js'

export default function PostHogIdentify() {
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      })
    } else if (!isSignedIn) {
      posthog.reset()
    }
  }, [isSignedIn, user])

  return null
}
