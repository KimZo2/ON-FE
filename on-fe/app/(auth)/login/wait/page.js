'use client'
import { useEffect } from 'react'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import axios from 'axios'
import { saveAccessToken, saveNickName } from '@/util/AuthUtil'
import { getKakaoAccessToken, sendAccessToken } from '@/apis/auth'

const SERVER_URL = process.env.NEXT_PUBLIC_BE_SERVER_URL;
const CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URL = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL;

export default function OAuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const code = params.get('code')
  const oauthType = 'kakao';

  useEffect(() => {
    if (!code || !oauthType) {
      router.replace('/login')
      return
    }

    ; (async () => {
      try {
        const accessToken = await getKakaoAccessToken(code)
          .catch(error => {
            console.log(error);
            router.replace("/login");
          });

        const { token, nickname } = await sendAccessToken({ oauthType, accessToken });

        saveAccessToken(token);
        saveNickName(nickname);

        router.replace("/");

      } catch (err) {
        if (err.status === 428) {
          const { provider, providerId } = err.response.data;
          const query = new URLSearchParams({ provider, providerId }).toString()
          router.replace(`/login/additional-info?${query}`)
        }
        else {
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