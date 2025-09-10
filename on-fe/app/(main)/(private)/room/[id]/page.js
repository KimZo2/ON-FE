'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MetaverseContainer from '@/components/metaverse/MetaverseContainer';
import { isLoggedIn, getNickName } from '@/util/AuthUtil';

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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">로그인 상태 확인 중...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 max-w-md w-full mx-4 text-center">
                    <div className="mb-6">
                        <svg className="w-20 h-20 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-white mb-2">로그인이 필요합니다</h1>
                        <p className="text-blue-200 mb-6">
                            방에 입장하려면 먼저 로그인해주세요.<br />
                            다른 사용자들과 함께 공부해봐요!
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleLoginRedirect}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            로그인하러 가기
                        </button>

                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-md transition duration-200"
                        >
                            메인 페이지로 돌아가기
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-blue-300">
                        <p>• 소셜 로그인 지원</p>
                        <p>• 안전한 인증 시스템</p>
                        <p>• 개인정보 보호</p>
                    </div>
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