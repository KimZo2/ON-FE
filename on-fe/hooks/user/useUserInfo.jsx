import { backendApiInstance } from '@/apis/instance';
import ROUTES from '@/constants/ROUTES';
import { isLoggedIn } from '@/util/AuthUtil';
import { useState, useEffect } from 'react';

const useUserInfo = () => {
    const [userInfo, setUserInfo] = useState({ userId: null, userNickName: null });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await backendApiInstance.get(ROUTES.MYINFO);
                const { userId, nickName } = response.data;
                setUserInfo({ userId, userNickName: nickName });
            } catch(e){
                console.error("[useUserInfo] 조회 오류 : ", e);
                setUserInfo({userId : null, userNickName : null});
            }
        }
        if(isLoggedIn()) {
            fetchUserInfo();
        }
    }, []);

    return userInfo;
}

export default useUserInfo