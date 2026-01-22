import axios from "axios";
import { handleApiResponse } from "@/apis/utils/handleApiResponse";
import { transformAppError } from "@/apis/utils/transformAppError";
/**
 * Refresh API Instance
 * - 토큰 갱신 등 refresh 관련 API 요청을 보내는 인스턴스
 */
export const refreshApiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_SERVER_URL,
  withCredentials: true,
});

/**
 * Response Interceptor
 * - 서버 비즈니스 에러를 공통 포맷으로 throw
 * - 컴포넌트에서는 error.message만 사용하면 됨
 */
refreshApiInstance.interceptors.response.use(
  (response) => handleApiResponse(response),
  (error) => {
    return Promise.reject(transformAppError(error)); //
  }
);

