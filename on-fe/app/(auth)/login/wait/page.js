"use client"

import { Suspense } from 'react';
import OauthSignUp from '@/app/components/auth/OauthSignUp';
import LoadingSpinner from '@/app/components/loading/LoadingSpinner';

export default async function Page() {

    return (
    <div>
      <Suspense fallback={<LoadingSpinner/>}>
        <OauthSignUp/>
      </Suspense>
    </div>
  );
}