import React from 'react';
import Link from 'next/link';
import { getNickName, isLoggedIn } from '@/util/AuthUtil';

const Header = () => {

  const isLogin = isLoggedIn();

  return (
    <div className="flex justify-between px-[30px] py-[30px]">
        <Link href="/" className="text-white text-[1rem] font-normal font-press-start no-underline">ON</Link>
        {
          isLogin ? 
          <span className='text-white text-[1rem] font-normal font-pretendard no-underline leading-normal bg-transparent'>{getNickName()}님 안녕하세요!</span>
          :
          <Link href="/login" className="text-white text-[1rem] font-normal font-press-start no-underline hover:opacity-80">login</Link>
        }
    </div>

  )
}

export default Header