import React from 'react'
import { handleGithub, handleGoogle, handleKakao } from '@/util/AuthUtil'

const LoginForm = () => {
  return (
    <div className="flex flex-col gap-8 w-[20dvw] items-center">
      <p className="text-black text-center font-press-start text-[36px]">ON</p>

      {/* 카카오 로그인 */}
      <div
        className="flex items-center justify-center w-full px-6 py-6 gap-6
                   rounded-[12px] bg-[#FEE500] text-[1dvw] border border-[#BEBEBE]
                   hover:bg-[#4d2512] hover:text-white cursor-pointer transition-colors"
        onClick={handleKakao}
      >
        <div className="w-[35px] h-[35px] bg-[url('/assets/kakao_icon.svg')] bg-center bg-cover bg-no-repeat" />
        카카오 로그인
      </div>

      {/* 구글 로그인 */}
      <div
        className="flex items-center justify-center w-full px-6 py-6 gap-6
                   rounded-[12px] bg-white text-[1dvw] border border-[#BEBEBE]
                   hover:bg-[#585858] hover:text-white cursor-pointer transition-colors"
        onClick={handleGoogle}
      >
        <div className="w-[35px] h-[35px] bg-[url('/assets/google_icon.svg')] bg-center bg-cover bg-no-repeat" />
        구글 로그인
      </div>

      {/* 네이버 로그인 */}
      <div
        className="flex items-center justify-center w-full px-6 py-6 gap-5
                   rounded-[12px] bg-[#04C75B] text-[1dvw]
                   hover:bg-[#2DB400] hover:text-white cursor-pointer transition-colors"
      >
        <div className="w-[35px] h-[35px] bg-[url('/assets/naver_icon.svg')] bg-center bg-cover bg-no-repeat" />
        네이버 로그인
      </div>

      {/* 깃허브 로그인 */}
      <div
        className="flex items-center justify-center w-full px-6 py-6 gap-5
                   rounded-[12px] bg-white text-[1dvw] border border-[#BEBEBE]
                   hover:bg-black hover:text-white cursor-pointer transition-colors"
        onClick={handleGithub}
      >
        <div className="w-[35px] h-[35px] bg-[url('/assets/github_icon.svg')] bg-center bg-cover bg-no-repeat" />
        깃허브 로그인
      </div>
    </div>
  )
}

export default LoginForm
