'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MetaverseContainer from '@/components/metaverse/MetaverseContainer';
import FlyingStar from '@/components/background/FlyingStar';
import { isLoggedIn, getNickName } from '@/util/AuthUtil';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import ROUTES from '@/constants/ROUTES';

export default function MetaversePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userNickName, setUserNickName] = useState('');
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const loggedIn = isLoggedIn();
            const nickName = getNickName();

            if (loggedIn && nickName) {
                setIsAuthenticated(true);
                setUserNickName(nickName);
            } else {
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const handleLoginRedirect = () => {
        router.push(ROUTES.LOGIN);
    };

    if (isLoading) {
        return (
            <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
                <FlyingStar />
                <div className="w-[10dvw] relative z-10 bg-black bg-opacity-50 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-8 text-center">
                    <LoadingSpinner message='로그인 확인 중..' color='white' /> 
                </div>
            </div>
        );
    }


    return (
        <div className="w-full h-screen">
            <MetaverseContainer userNickName={userNickName} />
        </div>
    );
}