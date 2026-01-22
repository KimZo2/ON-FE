'use client'
import { useEffect, useCallback, useRef } from 'react';
import { isLoggedIn, getTokenExpire, saveAccessToken, saveTokenExpire, removeAccessToken, removeNickname, removeTokenExpire } from '@/util/AuthUtil';
import { refreshApiInstance } from '@/apis/instances/refreshApiInstance';
import API from '@/constants/API';
import { useUserStore } from '@/stores/userStore';

export const AuthProvider = ({ children }) => {
    const timerRef = useRef(null);
    const setStoreLoginStatus = useUserStore((state) => state.setLoginStatus);
    const setAuthStatus = useUserStore((state) => state.setAuthStatus);

    // 다음 갱신 시간 스케줄링 
    const scheduleNextRefresh = useCallback((tokenExpire) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const now = Date.now();
        const timeUntilExpire = tokenExpire - now;
        const refreshBuffer = 5 * 60 * 1000; // 5분 전
        const delayTime = timeUntilExpire - refreshBuffer;

        if (delayTime > 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`⏱️ Next refresh scheduled in ${Math.round(delayTime / 1000)}s`);
            }
            timerRef.current = setTimeout(async () => {
                try {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('🔄 Token refresh triggered');
                    }
                    const refreshRes = await refreshApiInstance.get(API.AUTH.REFRESH);
                    const { accessToken, accessTokenExpire } = refreshRes;
                    
                    saveAccessToken(accessToken);
                    saveTokenExpire(accessTokenExpire);
                    
                    setStoreLoginStatus(true);
                    scheduleNextRefresh(accessTokenExpire);
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('❌ Token refresh failed');
                    }
                    setStoreLoginStatus(false);
                    removeAccessToken();
                    removeNickname();
                    removeTokenExpire();
                }
            }, delayTime);
        }
    }, []);

    // 앱 초기화 (마운트 시점)
    useEffect(() => {
        const initAuth = async () => {
            setAuthStatus('loading');
            
            const token = getTokenExpire();
            const tokenExpire = Number(token);
            const fetchUser = useUserStore.getState().fetchUser;

            // 토큰 만료된 경우 갱신 시도
            if (tokenExpire && Date.now() >= tokenExpire) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('⚠️ Token expired, attempting refresh...');
                }
                try {
                    const refreshRes = await refreshApiInstance.get(API.AUTH.REFRESH);
                    const { accessToken, accessTokenExpire } = refreshRes;
                    
                    saveAccessToken(accessToken);
                    saveTokenExpire(accessTokenExpire);
                    
                    setStoreLoginStatus(true);
                    await fetchUser();
                    setAuthStatus('ready');
                    scheduleNextRefresh(accessTokenExpire);
                    return;
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('❌ Token refresh failed on init');
                    }
                    setStoreLoginStatus(false);
                    setAuthStatus('ready'); 
                    removeAccessToken();
                    removeNickname();
                    removeTokenExpire();
                    return;
                }
            }

            // 정상적인 토큰 상태 처리
            const isLogged = isLoggedIn();
            setStoreLoginStatus(isLogged);
            setAuthStatus('ready');

            if (isLogged) {
                await fetchUser();
                scheduleNextRefresh(tokenExpire);
            }
        };

        initAuth();

        // 컴포넌트 언마운트 시 타이머 정리
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [scheduleNextRefresh]);

    return <>{children}</>;
};