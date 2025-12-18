'use client';

import React from 'react';
import CodeInputForm from '@/components/form/room/CodeInputForm'; 
import BaseModal from '@/components/modal/BaseModal';      

export default function CodeRoomModal({ onClose, onStartLoading, onStopLoading }) {

  const handleFormSubmissionComplete = () => {
    onStopLoading && onStopLoading();
    onClose && onClose();
    // (선택 사항) 만약 코드 입력 성공 후 다른 페이지로 이동해야 한다면, 여기에 router.push() 등의 로직을 추가할 수 있습니다.
  };

  return (
    <BaseModal
      title="Code"     
      subtitle='입장하려는 방의 코드를 입력해 주세요!'                 
      onClose={onClose}                         
    >
      <CodeInputForm
        className="flex flex-col gap-[1rem]" // 이미지처럼 입력창과 버튼 사이에 간격(gap)을 줍니다.
        onFormSubmissionStart={onStartLoading}
        onFormSubmissionComplete={handleFormSubmissionComplete}
      />
    </BaseModal>
  );
}