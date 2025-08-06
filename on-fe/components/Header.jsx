'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { getNickName, isLoggedIn, removeAccessToken, removeNickName } from '@/util/AuthUtil';

const Header = () => {

  const router = useRouter();
  const isLogin = isLoggedIn();

  const handleLogout = () => {
    removeAccessToken();   // 토큰 삭제
    removeNickName();      // 닉네임 삭제
    router.replace('/');   // 홈으로 이동
  };

  return (
    <div className="flex justify-between px-[30px] py-[30px] items-center">
      <Link href="/" className="text-white text-[1rem] font-press-start">ON</Link>

      {isLogin ? (
        <div className="flex items-center gap-4">
          <span className="text-white text-[1rem] font-pretendard">{getNickName()}님 안녕하세요!</span>
          <button
            onClick={handleLogout}
            className="text-white text-[0.9rem] px-3 py-1 border border-white rounded hover:bg-white hover:text-black transition"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <Link href="/login" className="text-white text-[1rem] font-press-start hover:opacity-80">login</Link>
      )}
    </div>
  );

}

export default Header