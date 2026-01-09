'use client'
import Link from 'next/link.js';
import Image from 'next/image.js';
import DefaultPageFrame from '@/components/DefaultPageFrame.jsx';
import ROUTES from '@/constants/ROUTES.js';
import { pressStart2P } from '@/constants/FONT';


const Main = () => {
  const title = "ON";
  const sub_title = "Learn Together, Live Together";
  const slogan = "단순한 채팅이 아니라, 같은 공간에 함께 있다는 존재감으로 학습 동기부여를 받아보세요!";

  return (
    <DefaultPageFrame>

      {/* 본문 콘텐츠 */}
      <div className="relative max-w-[120rem] mx-auto py-[7rem] grid gap-[0.5rem] items-center justify-items-center text-center min-h-screen">
        <Image
          src="/assets/on_icon.svg"
          width={300}
          height={300}
          alt='on' />
        <div className="flex flex-col gap-[2rem] items-center">
          <div className={`${pressStart2P.className} antialiased text-white text-[1.5rem] font-semibold tracking-wider uppercase`}>{sub_title}</div>
          <div className={`${pressStart2P.className} text-[3rem] leading-[1.1] bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent`}>{title}</div>
          <div className="text-gray-300 leading-relaxed px-[5rem]">{slogan}</div>
          <Link
            href={ROUTES.ROOM}
            className="px-[2rem] py-[1rem] text-white rounded-xl bg-gray-500/70 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
                hover:-translate-y-0.5 hover:shadow-[0_20px_25px_rgba(0,0,0,0.15)]"
          >시작하기</Link>
        </div>
      </div>
    </DefaultPageFrame>
  );
};

export default Main;