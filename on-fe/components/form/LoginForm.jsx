import React from 'react'
import { handleGithub, handleKakao } from '@/util/AuthUtil'
import Link from 'next/link'
import { pressStart2P } from '@/constants/FONT'

const LoginForm = () => {
  return (
    <div className="flex flex-col gap-[2rem] w-fit items-center bg-black">
      <Link href="/" className={`${pressStart2P.className} text-white text-center text-[2.5rem]`}>ON</Link>

      {/* 카카오 로그인 */}
      <div
        className="flex items-center justify-center w-full mx-[5rem] px-[2rem] py-[1.5rem] gap-[2rem]
                   rounded-xl bg-[#FEE500] border border-[#BEBEBE]
                   hover:bg-[#4d2512] hover:text-white cursor-pointer transition-colors"
        onClick={handleKakao}
      >
        <div className="w-[2rem] h-[2rem] bg-[url('/assets/kakao_icon.svg')] bg-center bg-cover bg-no-repeat" />
        카카오 로그인
      </div>

      {/* 깃허브 로그인 */}
      <div
        className="flex items-center justify-center w-full px-[2rem] py-[1.5rem] gap-[2rem]
                   rounded-xl bg-white border border-[#BEBEBE]
                   hover:bg-black hover:text-white cursor-pointer transition-colors"
        onClick={handleGithub}
      >
        <div className="w-[2rem] h-[2rem] bg-[url('/assets/github_icon.svg')] bg-center bg-cover bg-no-repeat" />
        깃허브 로그인
      </div>
    </div>
  )
}

export default LoginForm
