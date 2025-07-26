"use client"
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const SERVER_URL = process.env.NEXT_PUBLIC_BE_SERVER_URL;

export default function Page() {

  const code = useSearchParams().get("code");
  const oauthType = useSearchParams().get('oauth');

  useEffect(() => {
    const response = axios.post(SERVER_URL + `/auth/login/${oauthType}`, { accessToken: code });
    
    if(response.status===200){
      loginSuccess();
    }
    else {
      const provider = response.data.provider;
      const providerId = response.data.providerId;
      requiredAdditionalInfo({provider, providerId});
    }
  })

  return (
    <div>
      <LoadingSpinner />
    </div>
  );
}

const loginSuccess = () => {
  const router = useRouter();
  router.push("/");
};
const requiredAdditionalInfo = ({provider, providerId}) => {
  router.push(`/additional-info?provider=${provider}&providerId=${providerId}`);
}