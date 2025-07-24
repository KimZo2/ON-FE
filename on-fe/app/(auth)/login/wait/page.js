"use client"

import { Suspense } from 'react';
import OauthSignUp from '@/components/auth/OauthSignUp';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

export default async function Page() {

    return (
    <div>
      <Suspense fallback={<LoadingSpinner/>}>
        <OauthSignUp/>
      </Suspense>
    </div>
  );
}