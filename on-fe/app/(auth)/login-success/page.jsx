import { Suspense } from 'react'
import OAuthCallbackContent from './OAuthCallbackContent'
import LoadingSpinner from '@/components/loading/LoadingSpinner'

export default function LoginSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  )
}
