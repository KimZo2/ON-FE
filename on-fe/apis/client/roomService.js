import { clientApiInstance } from '@/apis/instances/clientApiInstance'
import ROUTES from '@/constants/ROUTES'

export const roomService = {
  // 방 생성
  create(payload) {
    return clientApiInstance.post(ROUTES.ROOM, payload)
  },

  // 방 목록 조회 (페이징)
  fetchList({ page, size, keyword }) {
    return clientApiInstance.get(ROUTES.ROOM, {
      params: {
        page,
        size,
        keyword,
      },
    })
  },

  // 코드로 방 입장
  joinByCode(code) {
    return clientApiInstance.post('/room/join-by-code', { code })
  },

  // 기존 방 입장
  join(roomId) {
    return clientApiInstance.post(`/room/${roomId}/join`) // TODO: API 경로 확인 필요
  },
}
