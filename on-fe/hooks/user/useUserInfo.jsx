import { getNickName, isLoggedIn } from '@/util/AuthUtil';
import { useLayoutEffect } from 'react';
import { useState } from 'react'

const useUserInfo = () => {

    const [nickName, setNickName] = useState(null);

    useLayoutEffect(() => {
        if (isLoggedIn()) {
            const n = getNickName();
            setNickName(n);
        }
    }, [])

    return [nickName];
}

export default useUserInfo