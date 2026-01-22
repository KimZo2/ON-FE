'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import { saveAccessToken, saveNickname, saveTokenExpire } from '@/util/AuthUtil'
import ROUTES from '@/constants/ROUTES'
import { useUserStore } from '@/stores/userStore'

export default function OAuthCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const fetchUser = useUserStore((state) => state.fetchUser)
  const hasProcessed = useRef(false)

  const accessToken = params.get('accessToken')
  const accessTokenExpire = params.get('accessTokenExpire')
  const rawNickname = params.get('nickname')
  const nickname = decodeURIComponent(rawNickname || '')

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    if (!accessToken || !accessTokenExpire || !nickname) {
      router.replace(ROUTES.LOGIN)
      return
    }

    saveAccessToken(accessToken)
    saveTokenExpire(accessTokenExpire)
    saveNickname(nickname)
    fetchUser() // 로그인 직후 사용자 정보 로드

    
    router.replace(ROUTES.MAIN)
  }, [accessToken, accessTokenExpire, nickname, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner />
    </div>
  )
}
