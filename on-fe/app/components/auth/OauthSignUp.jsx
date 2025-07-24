'use client'
import React from 'react'
// 카ㅏㅋ오에서 받은 코드를 백엔드로 보내 (요청)
// 응답 받을 때 까지 로딩 (suspense)
// 응답 받고 조건문
// 성공하면, 메인
// 실패하면, additonal로 이동
import { usePathname, useSearchParams } from 'next/navigation';

const OauthSignUp = async () => {

   await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
    <div>
      {/* 받은 auth_code를 back으로 요청 보내기 */}
    </div>
  )
}

export default OauthSignUp