'use client'

import {React,useState} from 'react';
import FlyingStar from '../ui/background/FlyingStar.jsx';
import './main.css';
import Link from 'next/link.js';
import Image from 'next/image.js';
import Header from '../../components/Header.jsx';

const Main = () => {

  const title = "ON";
  const sub_title = "Learn Together, Live Together";
  const slogan = "단순한 채팅이 아니라, 같은 공간에 함께 있다는 존재감으로 학습 동기부여를 받아보세요!";

  const [ison,setOn] = useState(false);

  return (
    <div className="main-container">

      {/* 헤더 */}
      <Header/>

      {/* 별 배경 */}
      <FlyingStar />

      {/* 본문 콘텐츠 */}
      <div className="content">
          <Image 
          src="/assets/on_icon.svg"
          width={300}
          height={300}
          alt='on'/>
        <div className="text-section">
          <div className="main-title">{sub_title}</div>
          <div className="subtitle">{title}</div>
          <div className="description">{slogan}</div>
           <Link href="/login" className='button'>시작하기</Link>
        </div>
      </div>
    </div>
  );
};

export default Main;
