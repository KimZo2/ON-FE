'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'
import { getNickname, removeAccessToken, removeNickname, removeTokenExpire } from '@/util/AuthUtil';
import ROUTES from '@/constants/ROUTES';
import { pressStart2P } from '@/constants/FONT'
import { logoutRequest } from '@/apis/client/authService';
import { useUserStore } from '@/stores/userStore';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const loginStatus = useUserStore((state) => state.loginStatus);
  const authStatus = useUserStore((state) => state.status);
  const setLoginStatus = useUserStore((state) => state.setLoginStatus);
  const setAuthStatus = useUserStore((state) => state.setAuthStatus);
  const [mounted, setMounted] = useState(false);
  const [previousLoginState, setPreviousLoginState] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 로그인 상태가 변경되면 즉시 이전 상태 업데이트
  useEffect(() => {
    setPreviousLoginState(loginStatus);
  }, [loginStatus]);

  if (!mounted){
    return (
      <div className="h-[90px]" /> // 헤더 높이만 유지
    );
  }

  // 로딩 중일 때는 이전 상태 사용, 아니면 현재 상태 사용
  const displayLoginState = authStatus === 'loading' ? previousLoginState : loginStatus;

  const handleLogout = async () => {
  try {
    // 로그아웃 중임을 표시 (모달이 안 떠도록)
    setAuthStatus('loading');
    
    await logoutRequest();

    removeAccessToken();
    removeNickname();
    removeTokenExpire();
    
    setLoginStatus(false);
    setAuthStatus('ready');

    router.replace(ROUTES.MAIN);
  } catch (error) {
    console.error("로그아웃 중 오류 발생:", error);
    setLoginStatus(false);
    setAuthStatus('error'); // Set status to 'error' on failure
  }
};

  const handleMyPage = () => {
      router.push(ROUTES.MY_PAGE);
    }

  const isMyPage = pathname === ROUTES.MY_PAGE;

  return (
    <div className="flex justify-between px-[3rem] py-[3rem] items-center">
      <Link href="/" className={`${pressStart2P.className} text-white`}>ON</Link>

      {displayLoginState ? (
        <div className="flex items-center gap-[1rem]">
          <span className={`${pressStart2P.className} text-[1.5rem] text-white`}> Welcome {getNickname()}!</span>
          <button
            onClick={handleMyPage}
            className={`${pressStart2P.className} text-[1.2rem] px-[1rem] py-[0.5rem] rounded-xl transition
              ${isMyPage ? 'bg-white text-black border border-white' : 'text-white border border-white hover:bg-white hover:text-black'}`}
          >
            my page
          </button>
          <button
            onClick={handleLogout}
            className={`${pressStart2P.className} text-[1.2rem] text-white px-[1rem] py-[0.5rem] border border-white rounded-xl hover:bg-white hover:text-black transition`}
          >
            logout
          </button>
        </div>
      ) : (
        <Link href="/login" className={`${pressStart2P.className} text-white hover:opacity-80`}>login</Link>
      )}
    </div>
  );

}

export default Header
