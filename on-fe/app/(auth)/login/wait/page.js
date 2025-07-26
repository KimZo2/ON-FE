'use client'
import { useEffect } from 'react'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import axios from 'axios'

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
        // sendTempCode를 여기서 정의하거나, 필요한 값을 인자로 넘깁니다.

        const accessToken = await fetchKakaoAccessToken(code)
          .then(response => response.data)
          .then(data => data.access_token)
          .catch(error => {
            console.log(error);
            router.replace("/login");
          });

        console.log(accessToken);

        const response = await sendLoginRequest({ oauthType, accessToken });

        router.replace("/");

      } catch (err) {
        if (err.status === 428) {
          const {provider, providerId} = err.response.data;
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

const fetchKakaoAccessToken = (code) => {
  const data = {
    code,
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URL
  }

  return axios.post(
    "https://kauth.kakao.com/oauth/token",
    data,
    {
      headers:
        { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    }
  )
}

const sendLoginRequest = ({ oauthType, accessToken }) => {
  return axios.post(
    `${SERVER_URL}/auth/login/${oauthType}`,
    { accessToken: accessToken }
  )
}