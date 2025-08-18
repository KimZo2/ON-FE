'use client';

import { useState, useCallback, useMemo } from 'react';

/**
 * 페이지네이션 로직을 처리하는 훅
 * @param {Array} items - 페이지네이션할 전체 아이템 목록
 * @param {number} itemsPerPage - 페이지당 보여줄 아이템 개수
 */
export function usePagination(items, itemsPerPage) {
  const [currentPage, setCurrentPage] = useState(1);

  // 총 페이지 수 계산
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  // 현재 페이지에 해당하는 아이템 목록
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [currentPage, items, itemsPerPage]);

  // 다음 페이지로 이동
  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  // 이전 페이지로 이동
  const goToPrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  // 특정 페이지로 이동
  const goToPage = useCallback((pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);

  // 페이지를 리셋하는 함수 (예: 검색어 변경 시)
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToNextPage,
    goToPrevPage,
    goToPage,
    resetPage,
  };
}