'use client';

import React from 'react';

/**
 * 방 목록과 페이지네이션 화살표를 표시하는 컴포넌트
 * @param {object} props
 * @param {Array<object>} props.availableRooms - 현재 페이지에 보여줄 방 목록
 * @param {boolean} props.isSubmitting - 폼 제출 중인지 여부
 * @param {function} props.onRoomSelect - 방 클릭 시 핸들러
 * @param {function} props.goToPrevPage - 이전 페이지로 이동 핸들러
 * @param {function} props.goToNextPage - 다음 페이지로 이동 핸들러
 * @param {number} props.currentPage - 현재 페이지 번호
 * @param {number} props.totalPages - 총 페이지 수
 * @param {string} props.searchTerm - 현재 검색어 (메시지 표시용)
 */
export default function RoomListDisplay({
  availableRooms,
  isSubmitting,
  onRoomSelect,
  goToPrevPage,
  goToNextPage,
  currentPage,
  totalPages,
  searchTerm,
  hasNext
}) {
  
  return (
    <div>
      {availableRooms && availableRooms.length > 0 ? (        
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1 || isSubmitting}
            className="bg-black hover:bg-gray-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Previous page"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="grid grid-cols-3 gap-4 pb-4 flex-grow">
            {availableRooms.map(room => (
              <div
                key={room.roomId}
                onClick={() => !isSubmitting && onRoomSelect(room.roomId)}
                className={`bg-white text-gray-900 rounded-lg cursor-pointer transition-colors duration-200 p-4
                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} flex flex-col justify-between`}
              >
                {/* 방 이름 */}
                <div className="mb-2">
                    <h4 className="font-medium text-base">{room.roomName}</h4>
                </div>
                {/* 참여 인원 정보 */}
                <div className="flex items-center justify-end text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{room.roomCurrentPersonCnt}/{room.roomMaximumPersonCnt}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goToNextPage}
            disabled={! hasNext || isSubmitting}
            className="bg-black hover:bg-gray-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Next page"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-8 whitespace-pre-line">
            {searchTerm ? `'${searchTerm}'에 해당하는 방이 없습니다.\n새롭게 방을 생성하거나 입장해 보세요!` : '현재 참여 가능한 공개방이 없습니다.'}
        </p>
      )}
    </div>
  );
}