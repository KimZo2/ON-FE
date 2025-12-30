import axios from "axios";
import { handleApiResponse } from "@/apis/utils/handleApiResponse";

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
    // 서버 응답이 있는 경우
    if (error.response) {
      const serverError = error.response.data?.error;

      // 서버가 우리 규격의 error를 내려준 경우
      if (serverError?.code) {
        const apiError = new Error(serverError.message);
        apiError.type = "BUSINESS";
        apiError.code = serverError.code;
        apiError.raw = serverError;
        return Promise.reject(apiError);
      }

      // 서버 에러지만 규격 외 응답
      const httpError = new Error(
        error.response.data?.message || "서버 오류가 발생했습니다."
      );
      httpError.type = "HTTP";
      httpError.status = error.response.status;
      return Promise.reject(httpError);
    }

    // 네트워크 에러 (timeout, CORS 등)
    const networkError = new Error("네트워크 오류가 발생했습니다.");
    networkError.type = "NETWORK";
    return Promise.reject(networkError);
  }
);

