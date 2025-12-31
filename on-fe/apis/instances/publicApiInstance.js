import axios from "axios";
import { handleApiResponse } from "@/apis/utils/handleApiResponse";
import { transformAppError } from "@/apis/utils/transformAppError";
/**
 * Public API Instance
 * - 로그인, 회원가입 등 공개 API 요청을 보내는 인스턴스
 */
export const publicApiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Response Interceptor
 * - 서버 비즈니스 에러를 공통 포맷으로 throw
 * - 컴포넌트에서는 error.message만 사용하면 됨
 */
publicApiInstance.interceptors.response.use(
  (response) => handleApiResponse(response),
  (error) => {
    return Promise.reject(transformAppError(error)); //
  }
);

