'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import { saveAccessToken, saveNickname, saveTokenExpire } from '@/util/AuthUtil'
import { login } from '@/apis/client/authService'
import ROUTES from '@/constants/ROUTES'

const SUPPORTED = new Set(['kakao', 'github',]);

function OAuthCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const code = params.get('code')
  const oauthType = params.get('oauthType')  // 'kakao', 'github'

  // 로그인 페이지로 넘어온 이후, 로직
  useEffect(() => {

    // 각 Oauth 제공자로부터 받은 code를 통해, 토큰 생성해주는 함수 호출 로직
    const getAccessTokenByType = async (oauthType, code) => {
      if (!SUPPORTED.has(oauthType)) {
        throw new Error(`지원하지 않는 OAuth 타입입니다: ${oauthType}`);
      }
      // return await login({ oauthType, code });
    };

    if (!code || !oauthType) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    ; (async () => {
      try {
        const { token, tokenExpire, nickname } = await getAccessTokenByType(oauthType, code)
        saveAccessToken(token);
        saveTokenExpire(tokenExpire);
        saveNickname(nickname);
        router.replace(ROUTES.MAIN) // main page로 이동


      } catch (err) {
        if (err?.status === 428) { // 회원 정보가 없을 경우, 추가 정보 입력 페이지로 이동
          const { provider, providerId } = err.response.data
          const query = new URLSearchParams({ provider, providerId }).toString()
          router.replace(`${ROUTES.ADDITIONAL_INFO}?${query}`)
        } else {                  // 그 외 경우, 에러 발생 후 다시 로그인 페이지로 이동 
          console.error(err)
          router.replace(ROUTES.LOGIN)
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

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
      <OAuthCallbackContent />
    </Suspense>
  )
}
