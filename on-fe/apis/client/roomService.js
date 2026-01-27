import { clientApiInstance } from '@/apis/instances/clientApiInstance'
import API from '@/constants/API'

export const roomService = {
  // 방 생성
  create(payload) {
    return clientApiInstance.post(API.ROOM.BASE, payload)
  },

  // 방 목록 조회 (페이징)
  fetchList({ page, size, keyword }) {
    return clientApiInstance.get(API.ROOM.BASE, {
      params: {
        page,
        size,
        keyword,
      },
    })
  },

  // TODO: 추후 API 확정되면 메서드 구현 or 제거 필요
  // // 코드로 방 입장
  // joinByCode(code) {
  //   return clientApiInstance.post(API.ROOM.JOIN_BY_CODE, { code })
  // },
}
