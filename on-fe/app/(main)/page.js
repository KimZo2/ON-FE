'use client'

import {React,useState, useEffect} from 'react';
import FlyingStar from '../ui/background/FlyingStar.jsx';
import Link from 'next/link.js';
import Image from 'next/image.js';
import Header from '../../components/Header.jsx';
import { isLoggedIn } from '../../util/AuthUtil';

const Main = () => {

  const title = "ON";
  const sub_title = "Learn Together, Live Together";
  const slogan = "단순한 채팅이 아니라, 같은 공간에 함께 있다는 존재감으로 학습 동기부여를 받아보세요!";

  const [ison,setOn] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    setIsLogin(isLoggedIn());
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black bg-opacity-100">

      {/* 헤더 */}
      <Header/>

      {/* 별 배경 */}
      <FlyingStar />

      {/* 본문 콘텐츠 */}
      <div className="relative max-w-[1200px] mx-auto p-12 px-6 grid gap-12 items-center justify-items-center text-center min-h-screen">
          <Image 
          src="/assets/on_icon.svg"
          width={300}
          height={300}
          alt='on'/>
        <div className="flex flex-col gap-8 items-center max-w-[800px]">
          <div className="font-press-start text-white text-[0.8rem] font-semibold tracking-wider uppercase">{sub_title}</div>
          <div className="text-[2rem] font-black leading-[1.1] font-press-start bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{title}</div>
          <div className="text-gray-300 text-base leading-relaxed max-w-[32rem]">{slogan}</div>
          <div className="flex gap-4">
            {isLogin ? (
              <>
                <Link
                  href="/metaverse"
                  className="px-8 py-4 text-base text-white rounded-md bg-blue-600/70 shadow-[0_10px_15px_rgba(59,130,246,0.3)] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
                    hover:-translate-y-0.5 hover:shadow-[0_20px_25px_rgba(59,130,246,0.4)] hover:bg-blue-600/80"
                >메타버스 입장</Link>
                
                <Link
                  href="/dashboard"
                  className="px-8 py-4 text-base text-white rounded-md bg-green-600/70 shadow-[0_10px_15px_rgba(34,197,94,0.3)] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
                    hover:-translate-y-0.5 hover:shadow-[0_20px_25px_rgba(34,197,94,0.4)] hover:bg-green-600/80"
                >대시보드</Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-4 text-base text-white rounded-md bg-gray-700/70 shadow-[0_10px_15px_rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
                    hover:-translate-y-0.5 hover:shadow-[0_20px_25px_rgba(0,0,0,0.15)]"
                >시작하기</Link>
                
                <div className="px-8 py-4 text-base text-gray-400 rounded-md bg-gray-800/50 shadow-[0_10px_15px_rgba(0,0,0,0.1)] cursor-not-allowed relative group">
                  메타버스 체험
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    로그인이 필요합니다
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Main;