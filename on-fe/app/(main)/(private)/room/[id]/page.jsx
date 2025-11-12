'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import useUserInfo from '@/hooks/user/useUserInfo';

const MetaverseContainer = dynamic(
    () => import('@/components/metaverse/MetaverseContainer'),
    { ssr: false }
);


export default function MetaversePage({ params }) {
    // Next.js 최신 버전에서 params를 Promise로 처리
    const resolvedParams = use(params);
    const roomId = resolvedParams.id;
    const {userId, userNickname} = useUserInfo();


    return (
        <div className="w-full h-screen">
            <MetaverseContainer userId={userId} userNickname={userNickname} roomId={roomId} />
        </div>
    );
}
