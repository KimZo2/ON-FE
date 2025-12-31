'use client'
import ROUTES from "@/constants/ROUTES";
import useAuth from "@/hooks/auth/useAuth"
import { useRouter } from "next/navigation";
import { useLayoutEffect,useState } from "react";
import AlertModal from "../modal/AlertModal";

const AuthValidation = ({ loginRequired = true, children }) => {

    const [loginStatus] = useAuth();    
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false)

    useLayoutEffect(() => {
        if (loginStatus === null) return; // 로그인 상태가 아직 결정되지 않았으면 대기
        if (loginStatus === false && loginRequired) {
            setIsOpen(true)
        }
    }, [loginStatus, loginRequired, router]);
    
    return (
    <>
      {children}

      <AlertModal
        open={isOpen}
        title="로그인이 필요해요"
        description="이 기능을 사용하려면 로그인이 필요합니다."
        cancelText="취소"
        confirmText="로그인하기"
        onCancel={() => router.replace(ROUTES.MAIN)}
        onConfirm={() => router.replace(ROUTES.LOGIN)}
      />
    </>
  )
}

export default AuthValidation