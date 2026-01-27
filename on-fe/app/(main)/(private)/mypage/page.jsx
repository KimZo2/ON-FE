'use client';

import { useState, useEffect } from 'react';
import { CHARACTERS } from '@/constants/CHARACTERS';
import AvatarPreview from '@/components/avatar/AvatarPreview';
import AvatarSelector from '@/components/avatar/AvatarSelector';
import DefaultPageFrame from "@/components/DefaultPageFrame";
import { pressStart2P } from '@/constants/FONT';
import { userService } from '@/apis/client/userService';
import toast from 'react-hot-toast';
import {useUserStore} from '@/stores/userStore';

const Page = () => {

 const {
    nickname,
    avatar,
    status,
    fetchUser,
    updateAvatar,
  } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSave = async () => {
    try {
      await userService.changeCharacter(avatar);
      toast.success('캐릭터가 저장되었습니다!');
    } catch (e) {
      console.error('캐릭터 저장 실패', e);
      toast.error('캐릭터 저장 실패');
    }
  };

  if (status === 'loading') return <div>로딩 중...</div>;

  const handleExit = () => {
    window.history.back();
  }

  return (
  <DefaultPageFrame>
      <div className="h-full text-white px-[3rem] py-[4rem]">

        {/* My Page 헤더 */}
        <div className='flex justify-center'>
          <h1 className={`${pressStart2P.className} text-3xl font-bold mb-[3rem]`}>[ My Page ]</h1>
        </div>
        
        <div className="flex flex-row justify-between items-center gap-[2rem] h-[50rem]">

          {/* 왼쪽 영역: 현재 선택되어 있는 캐릭터와 닉네임 보여주는 영역 */}
          <div className="flex items-center justify-center w-[40rem] h-full border border-white rounded-xl">
            <AvatarPreview
              character={CHARACTERS[avatar]}
              nickname={nickname}
            />
          </div>

          {/* 오른쪽 영역: 캐릭터 선택 및 닉네임 변경 영역 */}
          <AvatarSelector
            characters={CHARACTERS}
            selectedIndex={avatar}
            onSelect={updateAvatar}
            nickname={nickname}
          />
        </div>

        {/* 버튼 */}
        <div className='flex justify-end mb-[3rem] items-center gap-[1rem] mt-[3rem]'>
          <button 
            className="bg-gray-500 text-black px-[2rem] py-[1rem] rounded-lg font-bold hover:bg-gray-600 transition"
            onClick={handleExit}
          >
            나가기
          </button>
          <button 
            className="bg-yellow-500 text-black px-[2rem] py-[1rem] rounded-lg font-bold hover:bg-yellow-600 transition"
            onClick={handleSave}
          >
            저장하기
          </button>
        </div>

    </div>
  </DefaultPageFrame>);
};

export default Page;