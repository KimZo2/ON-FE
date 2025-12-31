/**
 * Axios 에러 객체를 서비스 규격 에러 객체로 변환
 */
export const transformAppError = (error) => {
  // 1. 서버 응답이 있는 경우
  if (error.response) {
    const serverError = error.response.data?.error;

    // BUSINESS 타입 에러 (서버 정의 코드 존재)
    if (serverError?.code) {
      const apiError = new Error(serverError.message);
      apiError.type = "BUSINESS";
      apiError.code = serverError.code;
      apiError.raw = serverError;
      return apiError;
    }

    // HTTP 타입 에러 (규격 외 에러)
    const httpError = new Error(
      error.response.data?.message || "서버 오류가 발생했습니다."
    );
    httpError.type = "HTTP";
    httpError.status = error.response.status;
    return httpError;
  }

  // 2. 네트워크 에러 (timeout, CORS 등)
  const networkError = new Error("네트워크 오류가 발생했습니다.");
  networkError.type = "NETWORK";
  return networkError;
};