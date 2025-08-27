'use client';

import React from 'react';

/**
 * 재사용 가능한 기본 모달 컴포넌트
 * @param {object} props
 * @param {string} props.title - 모달의 제목
 * @param {string} props.subtitle - 모달의 부제목 (선택 사항)
 * @param {React.ReactNode} props.children - 모달 콘텐츠 영역에 렌더링될 내용
 * @param {function} props.onClose - 모달을 닫을 때 호출되는 함수
 * @param {string} [props.size='w-80'] - 모달 콘텐츠의 너비 (Tailwind CSS 클래스)
 */
export default function BaseModal({ title, subtitle, children, onClose, size = 'w-80' }) {
  // 모달 외부 클릭 시 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-70"
      onClick={handleOverlayClick}
    >
      {/* 모달 콘텐츠 영역 */}
      <div className={`bg-black border border-gray-600 rounded-2xl p-10 relative ${size}`}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-xl font-bold p-1" 
        >
          X {/* X 아이콘 대신 텍스트 'X' 사용 */}
        </button>

        {/* 모달 헤더 (제목 및 부제목) */}
        <div className="text-center mb-8">
          <h1 className="whitespace-nowrap text-white text-center font-press-start text-[30px]">{title}</h1>
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>

        {/* 모달 콘텐츠 (자식 요소) */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}