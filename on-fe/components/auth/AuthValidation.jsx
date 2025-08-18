'use client'

import useAuth from "@/hooks/auth/useAuth"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AuthValidation = ({ loginRequired = true, children }) => {

    const [loginStatus] = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loginRequired) {
            if (loginStatus == false) {
                alert("로그인이 필요합니다.");
                router.replace("/login");
            }
        }
    });

    return <>{children}</>
}

export default AuthValidation