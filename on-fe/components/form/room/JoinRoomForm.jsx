'use client'

import React from 'react';
import { useJoinRoom } from '@/hooks/room/useJoinRoom';
import CodeRoomModal from '@/components/modal/CodeRoomModal'; 

const JoinRoomForm = ({className, onFormSubmissionStart, onFormSubmissionComplete}) => {

    const { 
        searchTerm, 
        handleSearchChange, 
        showCodeModal, 
        handleOpenCodeModal, 
        handleCloseCodeModal, 
        handleJoinByCode, 
        isSubmitting, 
        availableRooms, 
        handleJoinExistingRoom, 
        currentPage,
        totalPages,
        goToNextPage,
        goToPrevPage,
        goToPage, 

        } = useJoinRoom(onFormSubmissionStart, onFormSubmissionComplete); 

    // '공개방 목록'에서 방 클릭 핸들러
    const handleRoomSelect = async (roomId) => {
        onFormSubmissionStart && onFormSubmissionStart(false); // 로딩 시작 (방 입장)
        await handleJoinExistingRoom(roomId); // 기존 방 입장 로직 호출
        onFormSubmissionComplete && onFormSubmissionComplete(); // 로딩 및 모달 닫기
    };

    return (
        <div className={`${className}`}>

            <div className="flex items-center justify-between mb-8 gap-4"> 
                <div className="relative flex-grow"> 
                    {/* 검색창 */}
                    <input
                        type="search"
                        id="site-search"
                        name="searchRoom"
                        placeholder="검색하기"
                        value={searchTerm} 
                        onChange={handleSearchChange}
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
                    onClick={handleOpenCodeModal}
                    className="bg-transparent border border-white text-white px-4 py-2 rounded">
                    code
                </button>  
            </div>

            

            {/* 현재 존재하는 방 목록 보여주는 부분 */}
            <div>
                {availableRooms && availableRooms.length > 0 ? (
                    // 방 목록과 양 옆 화살표 버튼을 위한 flex 컨테이너
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1 || isSubmitting}
                            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            aria-label="Previous page"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="grid grid-cols-3 gap-4 pb-4 flex-grow"> {/* 방 목록 그리드 */}
                            {availableRooms.map(room => (
                                <div
                                    key={room.id}
                                    onClick={() => !isSubmitting && handleRoomSelect(room.id)}
                                    className={`bg-white text-gray-900 p-4 rounded-lg cursor-pointer transition-colors duration-200
                                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                >
                                    <h4 className="font-medium text-base mb-2 truncate">{room.name}</h4>
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="text-gray-600">
                                            {room.participants}/{room.maxParticipants}명 참여중
                                        </p>
                                        {room.isPrivate && <span className="text-gray-500">🔒</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || isSubmitting}
                            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            aria-label="Next page"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm text-center py-8">
                        {/* 검색어 유무에 따라 메시지 변경 */}
                        {searchTerm ? `'${searchTerm}'에 해당하는 방이 없습니다.\n새롭게 방을 생성하거나 입장해 보세요!` : '현재 참여 가능한 공개방이 없습니다.'}
                    </p>
                )}

                {/* 페이지네이션 UI*/}
                {totalPages > 1 && (
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
                )}
            </div>

            {showCodeModal && (
                <CodeRoomModal
                    onClose={handleCloseCodeModal} 
                    onStartLoading={onFormSubmissionStart} // 로딩 시작 콜백 (선택 사항, 모달 내부에서 처리 가능)
                    onStopLoading={onFormSubmissionComplete} // 로딩 중지 콜백 (선택 사항, 모달 내부에서 처리 가능)
                />
            )}
        </div>
    )
}

export default JoinRoomForm