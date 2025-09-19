'use client';

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { isLoggedIn, getNickName } from '@/util/AuthUtil';

const MetaverseContainer = dynamic(
    () => import('@/components/metaverse/MetaverseContainer'),
    { ssr: false }
);


export default function MetaversePage({ params }) {
    // Next.js 최신 버전에서 params를 Promise로 처리
    const resolvedParams = use(params);
    const roomId = resolvedParams.id;
    const userNickName = getNickName();


    return (
        <div className="w-full h-screen">
            <MetaverseContainer userNickName={userNickName} roomId={roomId} />
        </div>
    );
}