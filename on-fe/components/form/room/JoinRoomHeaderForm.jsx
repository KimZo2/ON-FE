'use client';

import React from 'react';
import { toast } from 'react-hot-toast';

/**
 * 방 입장 모달의 검색창과 코드 버튼 헤더 컴포넌트
 * @param {object} props
 * @param {string} props.searchTerm - 검색어 상태
 * @param {function} props.onSearchChange - 검색어 변경 핸들러
 * @param {function} props.onOpenCodeModal - 코드 모달 열기 핸들러
 */
export default function JoinRoomHeaderForm({ searchTerm, onSearchChange, onOpenCodeModal }) {
  
  const handleCodeButtonClick = () => {
    //TODO: 초대 기능(코드로 방 입장 기능) 개선 필요
    toast('초대 기능은 곧 추가될 예정이에요!', {icon: '👋🏻',  duration: 1000 });
  }
  return (
    <div className="flex items-center justify-between mx-14 mb-8 gap-4"> 
      <div className="relative flex-grow"> 
        {/* 검색창 */}
        <input
            type="search"
            id="site-search"
            name="searchRoom"
            placeholder="검색하기"
            value={searchTerm} 
            onChange={onSearchChange}
            className="
                w-full h-[3.5rem] rounded-xl
                bg-transparent
                text-white placeholder:text-gray-400
                border border-gray-400
                px-[3rem] outline-none
                focus:border-white focus:ring-1 focus:ring-white
            "
        />
        <svg className="absolute left-[1rem] top-1/2 -translate-y-1/2 w-[1.5rem] h-[1.5rem] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {/* 코드로 입장하기 위한 코드 버튼 */}
      <button 
          onClick={handleCodeButtonClick} // TODO: 초대 기능(코드로 방 입장 기능) 개선 필요
          className="h-[3.5rem] bg-transparent border border-white text-white px-[1rem] py-[0.5rem] rounded-xl">
          code
      </button>  
    </div>
  );
}