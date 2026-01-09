'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'
import { getNickname, isLoggedIn, removeAccessToken, removeNickname, removeTokenExpire } from '@/util/AuthUtil';
import ROUTES from '@/constants/ROUTES';
import { pressStart2P } from '@/constants/FONT'
import { logoutRequest } from '@/apis/client/authService';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLogin, setIsLogin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLogin(isLoggedIn());
  }, []);

  if (!mounted){
    return (
      <div className="h-[90px]" /> // 헤더 높이만 유지
    );
  }

  const handleLogout = async () => {
  try {
    await logoutRequest();

    removeAccessToken();
    removeNickname();
    removeTokenExpire();
    setIsLogin(false);

    router.replace(ROUTES.MAIN);
  } catch (error) {
    console.error("로그아웃 중 오류 발생:", error);
  }
};

  const handleMyPage = () => {
      router.push(ROUTES.MY_PAGE);
    }

  const isMyPage = pathname === ROUTES.MY_PAGE;

  return (
    <div className="flex justify-between px-[3rem] py-[3rem] items-center">
      <Link href="/" className={`${pressStart2P.className} text-white`}>ON</Link>

      {isLogin ? (
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
