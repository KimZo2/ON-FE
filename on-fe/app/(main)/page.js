'use client'

import {React,useState} from 'react';
import FlyingStar from '../ui/background/FlyingStar.jsx';
import Link from 'next/link.js';
import Image from 'next/image.js';
import Header from '../../components/Header.jsx';
import { isLoggedIn } from '@/util/AuthUtil.js';

const Main = () => {

  const isLogin = isLoggedIn();

  const title = "ON";
  const sub_title = "Learn Together, Live Together";
  const slogan = "단순한 채팅이 아니라, 같은 공간에 함께 있다는 존재감으로 학습 동기부여를 받아보세요!";

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
           

           {isLogin ? 
                    <Link
                        href="/room"
                        className="px-8 py-4 text-base text-white rounded-md bg-gray-700/70 shadow-[0_10px_15px_rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
                          hover:-translate-y-0.5 hover:shadow-[0_20px_25px_rgba(0,0,0,0.15)]"
                      >시작하기</Link>   :
                    <Link
                        href="/login"
                        className="px-8 py-4 text-base text-white rounded-md bg-gray-700/70 shadow-[0_10px_15px_rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
                          hover:-translate-y-0.5 hover:shadow-[0_20px_25px_rgba(0,0,0,0.15)]"
                    >시작하기</Link>        
            }
           

        </div>
      </div>
    </div>
  );
};

export default Main;