'use client';

import React, { useState } from 'react';
import { useJoinRoom } from '@/hooks/room/useJoinRoom'; 

/**
 * 방 코드를 입력받는 폼 컴포넌트
 * @param {object} props
 * @param {string} props.className - 폼에 적용할 Tailwind CSS 클래스
 * @param {function} props.onFormSubmissionStart - 폼 제출 시작 시 호출되는 콜백 (로딩 시작)
 * @param {function} props.onFormSubmissionComplete - 폼 제출 완료 시 호출되는 콜백 (로딩 및 모달 닫기)
 */
export default function CodeInputForm({ 
  className, 
  onFormSubmissionStart, 
  onFormSubmissionComplete 
}) {
  const { 
    handleJoinByCode, // 코드로 방 입장 처리 함수
    isSubmitting      // 제출 중인지 여부 (useJoinRoom 훅에서 가져옴)
  } = useJoinRoom(); 

  const [code, setCode] = useState(''); // 코드 입력 필드의 상태
  const [error, setError] = useState('');

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작(새로고침) 방지

    // if (!code.trim()) { // 코드가 비어있는지 확인
    //   alert('코드를 입력해 주세요.');
    //   return;
    // }
    if (!code.trim()) {
    setError('입장 코드를 입력해 주세요.');
    return;
  }

    onFormSubmissionStart && onFormSubmissionStart(); // 모달 외부의 로딩 상태 시작
    await handleJoinByCode(code.trim()); // useJoinRoom 훅의 코드로 방 입장 함수 호출
    onFormSubmissionComplete && onFormSubmissionComplete(); // 모달 외부의 로딩 상태 및 모달 닫기 완료
  };

  

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        type="text"
        placeholder=""
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          if (error) setError('');
        }}
        className="w-full p-[1rem] rounded-xl text-white placeholder:text-gray-400 border border-gray-600 focus:border-white outline-none"
        disabled={isSubmitting} // 제출 중일 때 입력 필드 비활성화
      />
      {error && (
          <p className="mt-[0.5rem] text-lg text-red-400">
            {error}
          </p>
        )}

      <button
        type="submit"
        className="w-full bg-gray-500 hover:bg-yellow-500 text-white py-[1rem] rounded-xl transition-colors duration-200"
        disabled={isSubmitting}
      >
        입장하기
      </button>
    </form>
  );
}