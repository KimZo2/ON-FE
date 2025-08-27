'use client'

import ROUTES from "@/constants/ROUTES";
import useAuth from "@/hooks/auth/useAuth"
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";

const AuthValidation = ({ loginRequired = true, children }) => {

    const [loginStatus] = useAuth();    
    const router = useRouter();

    useLayoutEffect(() => {
        if (loginStatus === null) return; // 로그인 상태가 아직 결정되지 않았으면 대기
        if (loginStatus === false && loginRequired) {
            alert("로그인이 필요합니다.");
            router.replace(ROUTES.LOGIN);
        }
    }, [loginStatus, loginRequired, router]);
    
    return <>{children}</>
}

export default AuthValidation