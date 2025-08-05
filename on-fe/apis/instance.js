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

/**
 * 외부 서버로 요청을 보내는 인스턴스 생성
 */
export const createNewAxios = (config) => {
    return axios.create(config)
}