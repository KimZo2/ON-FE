'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import { saveAccessToken, saveNickName } from '@/util/AuthUtil'
import { goLogin } from '@/apis/auth'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const code = params.get('code')
  const oauthType = params.get('oauthType')  // 'kakao', 'github', 'google', 'naver'
  const SUPPORTED = new Set(['kakao','github','google','naver']);

  // 각 Oauth 제공자로부터 받은 code를 통해, 토큰 생성해주는 함수 호출 로직
  const getAccessTokenByType = async (oauthType, code) => {
  if (!SUPPORTED.has(oauthType)) {
    throw new Error(`지원하지 않는 OAuth 타입입니다: ${oauthType}`);
  }
  return await goLogin({ oauthType, code });
  };

  // 로그인 페이지로 넘어온 이후, 로직
  useEffect(() => {
    if (!code || !oauthType) {
      router.replace('/login')
      return
    }

    ;(async () => {
      try {
        const { token, nickname } = await getAccessTokenByType(oauthType, code)
        saveAccessToken(token);
        saveNickName(nickname);
        router.replace('/') // main page로 이동

      } catch (err) {
        if (err?.status === 428) { // 회원 정보가 없을 경우, 추가 정보 입력 페이지로 이동
          const { provider, providerId } = err.response.data
          const query = new URLSearchParams({ provider, providerId }).toString()
          router.replace(`/login/additional-info?${query}`)
        } else {                  // 그 외 경우, 에러 발생 후 다시 로그인 페이지로 이동 
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
