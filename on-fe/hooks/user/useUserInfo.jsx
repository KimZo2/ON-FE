import { backendApiInstance } from '@/apis/instance';
import ROUTES from '@/constants/ROUTES';
import { isLoggedIn } from '@/util/AuthUtil';
import { useLayoutEffect } from 'react';
import { useState } from 'react'

const useUserInfo = () => {

    const [userId, setUserId] = useState(null);
    const [nickName, setNickName] = useState(null);

    useLayoutEffect(() => {
        if (isLoggedIn()) { // 로그인 되어 있으면
            const { userId, nickname } = backendApiInstance.get(ROUTES.MYINFO);
            const n = nickname;
            setUserId(userId);
            setNickName(n);
        }
    }, []);

    return {userId, nickName};
}

export default useUserInfo