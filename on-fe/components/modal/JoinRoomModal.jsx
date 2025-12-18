'use client';

import React from 'react';
import BaseModal from '@/components/modal/BaseModal';      
import JoinRoomForm from '../form/room/JoinRoomForm';

export default function JoinRoomModal({ onClose, onStartLoading, onStopLoading }) {

  const handleFormSubmissionComplete = () => {
    onStopLoading && onStopLoading();
    onClose && onClose();
    // (선택 사항) 만약 방 입장 성공 후 다른 페이지로 이동해야 한다면, 여기에 router.push() 등의 로직을 추가할 수 있습니다.
  };

  return (
    <BaseModal
      title="Join Room!"   
      subtitle='입장 가능한 방을 선택해 주세요'                   
      onClose={onClose}     
      size='w-[50rem]'                    
    >
      <JoinRoomForm
        className="flex flex-col justify-between gap-3" 
        onFormSubmissionStart={onStartLoading}
        onFormSubmissionComplete={handleFormSubmissionComplete}
      />
    </BaseModal>
  );
}