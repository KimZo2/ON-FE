import { getAccessToken } from "@/util/AuthUtil";
import axios from "axios";

// TODO: withCredentials 처리해주기

/**
 * ON-BE 서버로 요청을 보내는 인스턴스 생성
 */
export const backendApiInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE_SERVER_URL,
    headers: {
        "Content-Type": "application/json",
    }
})

// JWT 토큰 추가
backendApiInstance.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            
        }
        return config;
    },
    (error) => Promise.reject(error)
)

/**
 * 외부 서버로 요청을 보내는 인스턴스 생성
 */
export const createNewAxios = (config) => {
    return axios.create(config)
}

