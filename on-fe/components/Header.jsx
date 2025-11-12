'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { getNickname, isLoggedIn, removeAccessToken, removeNickname, removeTokenExpire } from '@/util/AuthUtil';
import ROUTES from '@/constants/ROUTES';
import { pressStart2P } from '@/constants/FONT'
import { logoutRequest } from '@/apis/instance';

const Header = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    setIsLogin(isLoggedIn());
  }, []);

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

  return (
    <div className="flex justify-between px-[30px] py-[30px] items-center">
      <Link href="/" className={`${pressStart2P.className} text-white text-[1rem]`}>ON</Link>

      {isLogin ? (
        <div className="flex items-center gap-4">
          <span className="text-white text-[1rem]"> Welcome {getNickname()}!</span>
          <button
            onClick={handleLogout}
            className={`${pressStart2P.className} text-white text-[0.9rem] px-3 py-1 border border-white rounded hover:bg-white hover:text-black transition`}
          >
            logout
          </button>
        </div>
      ) : (
        <Link href="/login" className={`${pressStart2P.className} text-white text-[1rem] hover:opacity-80`}>login</Link>
      )}
    </div>
  );

}

export default Header
