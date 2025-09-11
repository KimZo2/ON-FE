'use client'

import { isLoggedIn } from '@/util/AuthUtil';
import { useLayoutEffect, useState } from 'react'

const useAuth = () => {

    const [loginStatus, setLoginStatus ] = useState(isLoggedIn());

    return [loginStatus];
}

export default useAuth;