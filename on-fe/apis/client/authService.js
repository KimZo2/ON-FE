import API from "@/constants/API";
import { clientApiInstance } from "../instances/clientApiInstance";

/**
 * 로그아웃 요청 (Refresh Token 삭제)
 */
export const logoutRequest = async () => {
  return await clientApiInstance.post(API.AUTH.LOGOUT);
};
