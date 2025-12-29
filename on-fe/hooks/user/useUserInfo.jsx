import { userService } from '@/apis/client/userService';
import { isLoggedIn } from '@/util/AuthUtil';
import { useState, useEffect } from 'react';

const useUserInfo = () => {
    const [userInfo, setUserInfo] = useState({ userId: null, userNickname: null });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await userService.getMyInfo();
                const { userId, nickname } = response;
                setUserInfo({ userId, userNickname: nickname });
            } catch(e){
                console.error("[useUserInfo] 조회 오류 : ", e);
                setUserInfo({userId : null, userNickname : null});
            }
        }
        if(isLoggedIn()) {
            fetchUserInfo();
        }
    }, []);

    return userInfo;
}

export default useUserInfo
