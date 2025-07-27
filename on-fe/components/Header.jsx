import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './header.css'
import { getNickName, isLoggedIn } from '@/util/AuthUtil';

const Header = () => {

  const isLogin = isLoggedIn();

  return (
    <div className="headers">
        <Link href="/" className="logo">ON</Link>
        {
          isLogin ? 
          <span className='nickName'>{getNickName()}님 안녕하세요!</span>
          :
          <Link href="/login" className="login">login</Link>
        }
    </div>

  )
}

export default Header