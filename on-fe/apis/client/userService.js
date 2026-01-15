import { clientApiInstance } from '@/apis/instances/clientApiInstance'
import { publicApiInstance } from '@/apis/instances/publicApiInstance'
import API from '@/constants/API'

export const userService = {
  // 내 정보 조회
  // 응답: { memberId: String, nickname: String}
  getMyInfo() {
    return clientApiInstance.get(API.USER.MYINFO)
  },

  // 추가 정보 입력(소셜 회원가입 완료)
  signup(payload) {
    return publicApiInstance.post(API.AUTH.SIGNUP, payload)
  },

  // 캐릭터 정보 조회
  // 응답: { nickname: String, avatar: number }
  getCharacterInfo() {
    return clientApiInstance.get(API.USER.CHARACTER_INFO)
  },

  // 캐릭터 변경
  // payload: { memberId: String, avatar: number }
  // 응답 : 없음
  changeCharacter(payload) {
    return clientApiInstance.post(API.USER.CHANGE_CHARACTER, payload)
  }
}
