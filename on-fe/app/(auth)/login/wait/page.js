'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import axios from 'axios'

const SERVER_URL = process.env.NEXT_PUBLIC_BE_SERVER_URL

export default function OAuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const code      = params.get('code')
  // const oauthType = params.get('oauth')
  const oauthType = 'kakao';

  useEffect(() => {
    if (!code || !oauthType) {
      router.replace('/login')
      return
    }

    ;(async () => {
      try {
        // sendTempCode를 여기서 정의하거나, 필요한 값을 인자로 넘깁니다.
        const res = await axios.get(
          `${SERVER_URL}/auth/login/${oauthType}`,
          { accessToken: code }
        )

        if (res.status === 200 && res.data.registered) {
          router.replace('/')
        } else {
          const { provider, providerId } = res.data
          const query = new URLSearchParams({ provider, providerId }).toString()
          router.replace(`/additional-info?${query}`)
        }
      } catch (err) {
        console.error(err)
        router.replace('/login')
      }
    })()
  }, [code, oauthType, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner />
    </div>
  )
}