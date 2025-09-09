import axios from "axios";
import { getAccessToken } from "@/util/AuthUtil"

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

// Request interceptor: 인증된 요청에만 accessToken 자동 추가
backendApiInstance.interceptors.request.use(
    (config) => {
        try {
            const accessToken = getAccessToken();
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        } catch (error) {
            console.warn('Failed to get accessToken from localStorage:', error);
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