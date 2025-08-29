'use client';

import React from 'react';

/**
 * 방 입장 모달의 검색창과 코드 버튼 헤더 컴포넌트
 * @param {object} props
 * @param {string} props.searchTerm - 검색어 상태
 * @param {function} props.onSearchChange - 검색어 변경 핸들러
 * @param {function} props.onOpenCodeModal - 코드 모달 열기 핸들러
 */
export default function JoinRoomHeaderForm({ searchTerm, onSearchChange, onOpenCodeModal }) {
  return (
    <div className="flex items-center justify-between ml-13 mr-14 mb-8 gap-4"> 
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
                w-full h-14 rounded-xl
                bg-transparent
                text-white placeholder:text-white/50
                border border-white/50
                px-12 outline-none
                focus:border-white focus:ring-1 focus:ring-white
            "
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {/* 코드로 입장하기 위한 코드 버튼 */}
      <button 
          onClick={onOpenCodeModal}
          className="h-14 bg-transparent border border-white text-white px-4 py-2 rounded-xl">
          code
      </button>  
    </div>
  );
}