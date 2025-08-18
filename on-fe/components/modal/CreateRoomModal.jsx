'use client';

import React from 'react';
import CreateRoomForm from '@/components/form/room/CreateRoomForm'; 
import BaseModal from '@/components/modal/BaseModal';      

export default function CreateRoomModal({ onClose, onStartLoading, onStopLoading }) {

  const handleFormSubmissionComplete = () => {
    onStopLoading && onStopLoading();
    onClose && onClose();
    // (선택 사항) 만약 방 생성 성공 후 다른 페이지로 이동해야 한다면, 여기에 router.push() 등의 로직을 추가할 수 있습니다.
  };

  return (
    <BaseModal
      title="Create Room!"     
      subtitle='입장하기 전, 새로운 방을 생성해 주세요!'                 
      onClose={onClose}                         
      size="w-[25dvw]"
    >
      <CreateRoomForm
        className="flex flex-col justify-between gap-4" 
        onFormSubmissionStart={onStartLoading}
        onFormSubmissionComplete={handleFormSubmissionComplete}
      />
    </BaseModal>
  );
}