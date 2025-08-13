'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import { saveAccessToken, saveNickName } from '@/util/AuthUtil'
import {
  getKakaoAccessToken,
  getGithubAccessToken,
  getGoogleAccessToken,
  getNaverAccessToken,
  sendAccessToken
} from '@/apis/auth'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const code = params.get('code')
  const oauthType = params.get('oauthType')  // 'kakao', 'github', 'google', 'naver'

  // 타입에 따라 적절한 액세스 토큰 요청 함수 실행
  const getAccessTokenByType = async (oauthType, code) => {
    switch (oauthType) {
      case 'kakao':
        return await getKakaoAccessToken(code)
      case 'github':
        return await getGithubAccessToken(code)
      // case 'google':
      //   return await getGoogleAccessToken(code)
      // case 'naver':
      //   return await getNaverAccessToken(code)
      default:
        throw new Error(`지원하지 않는 OAuth 타입입니다: ${oauthType}`)
    }
  }

  useEffect(() => {
    if (!code || !oauthType) {
      router.replace('/login')
      return
    }

    ;(async () => {
      try {
        const accessToken = await getAccessTokenByType(oauthType, code)

        const { token, nickname } = await sendAccessToken({
          oauthType,
          accessToken
        })

        saveAccessToken(token)
        saveNickName(nickname)
        router.replace('/') // main page로 이동
      } catch (err) {
        if (err?.status === 428) { // 회원 정보가 없을 경우, 추가 정보 입력 페이지로 이동
          const { provider, providerId } = err.response.data
          const query = new URLSearchParams({ provider, providerId }).toString()
          router.replace(`/login/additional-info?${query}`)
        } else {
          console.error(err)
          router.replace('/login')
        }
      }
    })()
  }, [code, oauthType, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner />
    </div>
  )
}
