import { userService } from '@/apis/client/userService';
import { isLoggedIn } from '@/util/AuthUtil';
import { useState, useEffect } from 'react';

const useUserInfo = () => {
    const [userInfo, setUserInfo] = useState({ memberId: null, nickname: null });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await userService.getMyInfo();
                const { memberId, nickname } = response;
                setUserInfo({ memberId: memberId, nickname: nickname });
            } catch(e){
                console.error("[useUserInfo] 조회 오류 : ", e);
                setUserInfo({memberId : null, nickname : null});
            }
        }
        if(isLoggedIn()) {
            fetchUserInfo();
        }
    }, []);

    return userInfo;
}

export default useUserInfo
