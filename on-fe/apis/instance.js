import { getAccessToken, removeAccessToken, removeNickName, removeTokenExpire, saveTokenExpire } from "@/util/AuthUtil";
import axios from "axios";
import { isLoggedIn } from "@/util/AuthUtil";

// TODO: withCredentials 처리해주기

/**
 * 공용 API 인스턴스 (인증 불필요)
 * 로그인, 회원가입 등 인증이 필요하지 않은 요청용
 */
export const publicApiInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE_SERVER_URL,
    headers: {
        "Content-Type": "application/json",
    }
})

/**
 * 인증된 사용자용 API 인스턴스 (인증 필수)
 * Authorization 헤더가 자동으로 포함됨
 */
export const backendApiInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE_SERVER_URL,
    headers: {
        "Content-Type": "application/json",
    }
})


// Request interceptor: 인증된 요청에만 accessToken 자동 추가 & 만료시간 감지
backendApiInstance.interceptors.request.use(
    async (config) => {
        // 로그인 페이지나 /auth/refresh 요청은 interceptor 무시
        if (config.url.includes("/auth/login") || config.url.includes("/auth/refresh")) {
        return config;
        }
        // 그 외 모든 api 요청은 AT 검증 필요
        if (!isLoggedIn()) { // login이 유효하지 않다면 (로그아웃/AT만료/AT저장안됨)
            try {
                // Refresh Token으로 새 Access Token 발급 요청
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BE_SERVER_URL}/auth/refresh`, {}, { withCredentials: true });
                const { token, tokenExpire } = res.data;
                saveAccessToken(token);
                saveTokenExpire(tokenExpire);
            } catch (err) {
                // Refresh Token도 만료 → 재로그인
                removeAccessToken();
                removeNickName();
                removeTokenExpire();
                // TODO: 이동 전 사용자에게 재로그인 요청을 알리는 모달 혹은 메시지 표시 필요
                alert("세션이 만료되었습니다. 다시 로그인해주세요!");
                window.location.href = '/login';
                return Promise.reject(err);
            }
            }

    const accessToken = getAccessToken();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 외부 서버로 요청을 보내는 인스턴스 생성
 */
export const createNewAxios = (config) => {
    return axios.create(config)
}

