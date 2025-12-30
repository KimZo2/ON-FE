'use client'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import { saveAccessToken, saveNickname, saveTokenExpire } from '@/util/AuthUtil'
import ROUTES from '@/constants/ROUTES'

function OAuthCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const accessToken = params.get('accessToken')
  const tokenExpire = params.get('expireTime')
  const nickname = params.get('nickname')

  if (!accessToken || !tokenExpire || !nickname) {
      router.replace(ROUTES.LOGIN);
      return;
    }

  // 닉네임 한글 깨짐 방지 디코딩
  if (nickname) {
    nickname = decodeURIComponent(nickname);
  }

  // 토큰 저장 및 메인 페이지로 이동
  if (accessToken) {
    saveAccessToken(accessToken);
    saveTokenExpire(tokenExpire);
    saveNickname(nickname);
    router.replace(ROUTES.MAIN)
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner />
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
      <OAuthCallbackContent />
    </Suspense>
  )
}
