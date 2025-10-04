'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { getNickName, isLoggedIn, removeAccessToken, removeNickName } from '@/util/AuthUtil';
import ROUTES from '@/constants/ROUTES';
import { pressStart2P } from '@/constants/FONT'

const Header = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    setIsLogin(isLoggedIn());
  }, []);

  const handleLogout = () => {
    removeAccessToken();   // 토큰 삭제
    removeNickName();      // 닉네임 삭제
    setIsLogin(false);
    router.replace(ROUTES.MAIN);   // 홈으로 이동
  };

  return (
    <div className="flex justify-between px-[30px] py-[30px] items-center">
      <Link href="/" className={`${pressStart2P.className} text-white text-[1rem]`}>ON</Link>

      {isLogin ? (
        <div className="flex items-center gap-4">
          <span className="text-white text-[1rem]"> Welcome {getNickName()}!</span>
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