'use client'
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { isLoggedIn, getTokenExpire, saveAccessToken, saveTokenExpire, removeAccessToken, removeNickname, removeTokenExpire } from '@/util/AuthUtil';
import { refreshApiInstance } from '@/apis/instances/refreshApiInstance';
import API from '@/constants/API';
import { useUserStore } from '@/stores/userStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loginStatus, setLoginStatus] = useState(null);
    const timerRef = useRef(null);
    const setStoreLoginStatus = useUserStore((state) => state.setLoginStatus);
    const setAuthStatus = useUserStore((state) => state.setAuthStatus);

    // 다음 갱신 시간 스케줄링 
    const scheduleNextRefresh = useCallback((tokenExpire) => {
        // 기존 타이머 제거
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const now = Date.now();
        const timeUntilExpire = tokenExpire - now;
        const refreshBuffer = 5 * 60 * 1000; // 5분 전
        const delayTime = timeUntilExpire - refreshBuffer;

        if (delayTime > 0) {
            console.log(`⏱️ Next refresh scheduled in ${Math.round(delayTime / 1000)}s`);
            timerRef.current = setTimeout(async () => {
                try {
                    console.log('🔄 Token refresh triggered');
                    const refreshRes = await refreshApiInstance.get(API.AUTH.REFRESH);
                    const { accessToken, accessTokenExpire } = refreshRes;
                    
                    saveAccessToken(accessToken);
                    saveTokenExpire(accessTokenExpire);
                    
                    setLoginStatus(true);
                    setStoreLoginStatus(true);
                    // 다음 갱신 다시 스케줄링
                    scheduleNextRefresh(accessTokenExpire);
                } catch (error) {
                    console.log('❌ Token refresh failed');
                    setLoginStatus(false);
                    setStoreLoginStatus(false);
                }
            }, delayTime);
        }
    }, []);

    // 앱 초기화 (마운트 시점)
    useEffect(() => {
        const initAuth = async () => {
            // 로딩 상태 시작
            setAuthStatus('loading');
            
            // 1. 토큰 존재 여부 확인 (만료 여부 무시)
            const token = getTokenExpire();
            const tokenExpire = Number(token);

            // 2. 만료된 토큰 존재 시 갱신 시도
            if (tokenExpire && Date.now() >= tokenExpire) {
                console.log('⚠️ Token expired, attempting refresh...');
                try {
                    const refreshRes = await refreshApiInstance.get(API.AUTH.REFRESH);
                    const { accessToken, accessTokenExpire } = refreshRes;
                    
                    saveAccessToken(accessToken);
                    saveTokenExpire(accessTokenExpire);
                    
                    setLoginStatus(true);
                    setStoreLoginStatus(true);
                    setAuthStatus('ready');
                    scheduleNextRefresh(accessTokenExpire);
                    return;
                } catch (error) {
                    console.log('❌ Token refresh failed on init');
                    setLoginStatus(false);
                    setStoreLoginStatus(false);
                    setAuthStatus('ready');
                    removeAccessToken();
                    removeNickname();
                    removeTokenExpire();
                    return;
                }
            }

            // 3. 정상적인 토큰 상태 처리
            const isLogged = isLoggedIn();
            setLoginStatus(isLogged);
            setStoreLoginStatus(isLogged);
            setAuthStatus('ready');

            if (isLogged) {
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

    return (
        <AuthContext.Provider value={{ loginStatus, setLoginStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
};