import axios from "axios";
import { isLoggedIn } from "@/util/AuthUtil";
import { getAccessToken, saveAccessToken,saveTokenExpire } from "@/util/AuthUtil";

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
    },
    withCredentials: true, // 쿠키 전송 허용

})

// 요청 interceptor: Access Token 자동 추가
backendApiInstance.interceptors.request.use(
  (config) => {
    if (config.url.includes("/auth/login") || config.url.includes("/auth/refresh")) {
      return config;
    }

    const token = getAccessToken();
    if (token && isLoggedIn()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 interceptor: 401 → refresh 후 원래 요청 재시도
backendApiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // console.log("interceptor error:", error); 

    // Access Token 만료로 401 발생
    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        const refreshResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_SERVER_URL}/auth/refresh`,
          { withCredentials: true }
        );
        const { token, tokenExpire } = refreshResponse.data;

        if (!token) throw new Error("Refresh 실패: token 없음");

        // 새 토큰 저장
        saveAccessToken(token);
        saveTokenExpire(tokenExpire);
        // console.log("Access Token 갱신 완료!");

        // 원래 요청 헤더에 새 토큰 적용
        originalRequest.headers.Authorization = `Bearer ${token}`;

        /// 원래 요청 재시도
        const retryResponse = await backendApiInstance(originalRequest);
        return retryResponse;


      } catch (refreshError) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요!");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * 로그아웃 요청 (Refresh Token 삭제)
 */
export const logoutRequest = async () => {
  try {
    const response = await backendApiInstance.post("/auth/logout", {}, {
      withCredentials: true, // 쿠키 포함
    });
    return response.data;
  } catch (error) {
    console.error("로그아웃 요청 실패:", error);
    throw error;
  }
};


/**
 * 외부 서버로 요청을 보내는 인스턴스 생성
 */
export const createNewAxios = (config) => {
    return axios.create(config)
}

