'use client';

import React from 'react';

/**
 * 페이지네이션 점들을 표시하는 컴포넌트
 * @param {object} props
 * @param {number} props.currentPage - 현재 페이지 번호
 * @param {number} props.totalPages - 총 페이지 수
 * @param {function} props.goToPage - 특정 페이지로 이동 핸들러
 * @param {boolean} props.isSubmitting - 제출 중인지 여부 (버튼 비활성화용)
 */
export default function PaginationDots({ currentPage, totalPages, goToPage, isSubmitting }) {
  if (totalPages <= 1) return null; // 페이지가 하나 이하면 점을 표시할 필요 없음

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
            key={i}
            onClick={() => goToPage(i + 1)}
            disabled={isSubmitting}
            className={`w-3 h-3 rounded-full transition-colors duration-200
                        ${currentPage === i + 1 ? 'bg-white' : 'bg-gray-500 hover:bg-gray-400'}
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={`Go to page ${i + 1}`}
        />
      ))}
    </div>
  );
}