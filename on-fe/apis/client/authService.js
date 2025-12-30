import API from "@/constants/API";
import { publicApiInstance } from "../instances/publicApiInstance";
import { clientApiInstance } from "../instances/clientApiInstance";
import { handleApiResponse } from "../utils/handleApiResponse";

/**
 * OAuth 로그인
 */
// TODO: backend 로직 변경으로 인해 제거 필요 & 동작 확인 후 삭제
// export const login = async({ oauthType, code }) => {
//   const res = await publicApiInstance.get(API.AUTH.OAUTH_LOGIN(oauthType), {
//     params: { code },
//   });
//   return handleApiResponse(res);
// };

/**
 * 로그아웃 요청 (Refresh Token 삭제)
 */
export const logoutRequest = async () => {
  try {
    // interceptor에서 response.data를 반환하므로
    // 여기서 받는 값은 이미 "data"
    const data = await clientApiInstance.post(API.AUTH.LOGOUT);
    return data;
  } catch (error) {
    console.error("로그아웃 요청 실패:", error);
    throw error;
  }
};
