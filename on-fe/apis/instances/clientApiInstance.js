"use client";
import axios from "axios";
import {isLoggedIn,getAccessToken,saveAccessToken,saveTokenExpire,} from "@/util/AuthUtil";
import API from "@/constants/API";
import { handleApiResponse } from "@/apis/utils/handleApiResponse";
import { transformAppError } from "@/apis/utils/transformAppError";
/**
 * Client API Instance
 * - 인증이 필요한 API 요청을 보내는 인스턴스
 */
export const clientApiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/*
요청 인터셉터
- 로그인, 토큰 갱신 요청: Access Token 추가 없음
- 그 외 요청: Access Token 자동 추가
*/
clientApiInstance.interceptors.request.use(
  (config) => {
    if (
      config.url?.includes(API.AUTH.LOGIN) ||
      config.url?.includes(API.AUTH.REFRESH)
    ) {
      return config;
    }

    const token = getAccessToken();
    if (token && isLoggedIn()) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* 
응답 인터셉터
- 응답 구조에 맞춰 data 반환
- 401 에러 발생 시 토큰 갱신 시도
- 토큰 갱신 후 원래 요청 재시도
- 토큰 갱신 실패 시 로그인 페이지로 이동
*/
clientApiInstance.interceptors.response.use(
  (response) => handleApiResponse(response),

  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // 401 에러 처리 (토큰 갱신)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await clientApiInstance.get(API.AUTH.REFRESH);
        const { accessToken, accessTokenExpire } = refreshRes;

        saveAccessToken(accessToken);
        saveTokenExpire(accessTokenExpire);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return clientApiInstance(originalRequest);
      } catch (refreshResError) {
        // 갱신 실패 시 로그인 유도 및 변환된 에러 전달
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(transformAppError(refreshResError));
      }
    }

    // 그 외 모든 에러 (401 제외한 HTTP, BUSINESS, NETWORK)
    return Promise.reject(transformAppError(error));
  }
);
