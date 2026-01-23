import { userService } from '@/apis/client/userService';
import { isLoggedIn } from '@/util/AuthUtil';
import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

const useUserInfo = () => {
    const memberId = useUserStore(state => state.memberId);
    const nickname = useUserStore(state => state.nickname);   
    const status = useUserStore(state => state.status);
    const fetchUser = useUserStore(state => state.fetchUser);

    useEffect(() => {
    if (status === 'idle' || status === 'error') {
      fetchUser();
    }
  }, [status, fetchUser]);

    return {
    memberId,
    nickname
  };
}

export default useUserInfo
