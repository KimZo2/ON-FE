'use client';

import { useState, useEffect, use } from 'react';
import MetaverseContainer from '@/components/metaverse/MetaverseContainer';
import { isLoggedIn, getNickName } from '@/util/AuthUtil';


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