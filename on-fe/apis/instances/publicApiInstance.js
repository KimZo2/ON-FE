import axios from "axios";

/**
 * 로그인, 회원가입 등 공개 API 요청을 보내는 인스턴스
 */
export const publicApiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
