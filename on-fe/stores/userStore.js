import { create } from 'zustand';
import { userService } from '@/apis/client/userService';

export const useUserStore = create((set, get) => ({
  // 상태
  memberId: null,
  nickname: '',
  avatar: 0,

  status: 'idle', // idle | loading | ready | error

  // 액션
  fetchUser: async () => {
    const { status } = get();
    if (status === 'loading' || status === 'ready') return;

    set({ status: 'loading' });

    try {
      const [myInfo, characterInfo] = await Promise.all([
        userService.getMyInfo(),
        userService.getCharacterInfo(),
      ]);

      set({
        memberId: myInfo.memberId,
        nickname: characterInfo.nickname,
        avatar: characterInfo.avatar ?? 0,
        status: 'ready',
      });
    } catch (e) {
      console.error('유저 정보 로딩 실패', e);
      set({ status: 'error' });
    }
  },

  updateAvatar: (avatar) => {
    set({ avatar });
  },
}));
