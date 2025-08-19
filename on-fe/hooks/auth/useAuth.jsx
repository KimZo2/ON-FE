'use client'

import { isLoggedIn } from '@/util/AuthUtil';
import { useLayoutEffect, useState } from 'react'

const useAuth = () => {

    const [loginStatus, setLoginStatus ] = useState(isLoggedIn());

    // 브라우저가 layout 단계에서 실행되는 로직, 사용자에게 보이지 않는다.
    useLayoutEffect(() => {
        const loginStatus = isLoggedIn();
        setLoginStatus(loginStatus);
    }, [])

    return [loginStatus];
}

export default useAuth