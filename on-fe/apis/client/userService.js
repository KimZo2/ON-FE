import { clientApiInstance } from '@/apis/instances/clientApiInstance'
import { publicApiInstance } from '@/apis/instances/publicApiInstance'
import API from '@/constants/API'
import ROUTES from '@/constants/ROUTES'

export const userService = {
  // 내 정보 조회
  getMyInfo() {
    return clientApiInstance.get(API.USER.MYINFO)
  },

  // 추가 정보 입력(소셜 회원가입 완료)
  signup(payload) {
    return publicApiInstance.post(API.USER.ADDITIONAL_INFO, payload)
  },
}
