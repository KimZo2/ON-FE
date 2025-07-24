'use client'
import { Suspense } from 'react';
import {OauthSignUp} from '@/app/components/auth/OauthSignup'

export default function Page() {

    return (
    <div>
      <Suspense fallback={()=> <p>사용자 정보 불러오는 중...</p>}>
        {/* <불러오는 컴포넌트/> */}
        <OauthSignUp/>
      </Suspense>
    </div>
  );
}