'use client'

import React from 'react';
import { useJoinRoom } from '@/hooks/room/useJoinRoom';
import CodeRoomModal from '@/components/modal/CodeRoomModal'; 
import JoinRoomHeaderForm from '../room/JoinRoomHeaderForm';
import RoomListDisplay from '../room/RoomListDisplay';

const JoinRoomForm = ({className, onFormSubmissionStart, onFormSubmissionComplete}) => {

    const { 
        searchTerm, 
        handleSearchChange, 
        showCodeModal, 
        handleOpenCodeModal, 
        handleCloseCodeModal, 
        isSubmitting,
        availableRooms, 
        handleJoinExistingRoom, 
        currentPage,
        totalPages,
        goToNextPage,
        goToPrevPage,
        hasNext,
        } = useJoinRoom(onFormSubmissionStart, onFormSubmissionComplete); 

    // '공개방 목록'에서 방 클릭 핸들러
    const handleRoomSelect = async (roomId) => {
        onFormSubmissionStart && onFormSubmissionStart(false); // 로딩 시작 (방 입장)
        await handleJoinExistingRoom(roomId); // 기존 방 입장 로직 호출
        onFormSubmissionComplete && onFormSubmissionComplete(); // 로딩 및 모달 닫기
    };

    return (
        <div className={`${className}`}>

            <JoinRoomHeaderForm 
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onOpenCodeModal={handleOpenCodeModal}
            />

            <RoomListDisplay
                availableRooms={availableRooms}
                isSubmitting={isSubmitting}
                onRoomSelect={handleRoomSelect}
                goToPrevPage={goToPrevPage}
                goToNextPage={goToNextPage}
                currentPage={currentPage}
                totalPages={totalPages}
                searchTerm={searchTerm}
                hasNext={hasNext}
            />

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