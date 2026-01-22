'use client'
import ROUTES from "@/constants/ROUTES";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AlertModal from "../modal/AlertModal";
import { useUserStore } from "@/stores/userStore";

const AuthValidation = ({ loginRequired = true, children }) => {

    const loginStatus = useUserStore((state) => state.loginStatus);
    const authStatus = useUserStore((state) => state.status);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // 인증 상태 로딩 중: 아무것도 하지 않음
        if (authStatus === 'loading') {
            setIsOpen(false);
            return;
        }

        // 인증 완료 후: 로그인 필요 여부 체크
        if (loginRequired && !loginStatus) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [loginStatus, loginRequired, authStatus]);
    
    return (
        <>
            {/* 로딩 중이면 컨텐츠만 렌더링 (모달 제외) */}
            {authStatus === 'loading' ? children : (
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
            )}
        </>
    );
}

export default AuthValidation