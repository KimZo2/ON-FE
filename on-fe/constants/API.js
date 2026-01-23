/**
 * 데이터 fetch, 서버로 데이터 전송 시 사용하는 API URI를 관리하는 js
 */

const AUTH = {
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/reissue",
    LOGIN: "/auth/login",
};

const WEBSOCKET = {
    WS : "/ws"
}

const METAVERSE = {
    // Publish (클라이언트 → 서버)
    JOIN : (roomId) => `/app/room/${roomId}/join`,
    LEAVE : (roomId) => `/app/room/${roomId}/leave`,
    MOVE : (roomId) => `/app/room/${roomId}/move`,
    PING : (roomId) => `/app/room/${roomId}/ping`,
    SYNC : (roomId) => `/app/room/${roomId}/sync`,
    CHAT : (roomId) => `/app/room/${roomId}/chat`,
    PLAYER_LEFT : "/app/playerLeft",
    
    // Subscribe (서버 → 클라이언트)
    QUEUE_JOIN : "/user/queue/join",
    QUEUE_POS_SNAPSHOT : "/user/queue/pos-snapshot",
    QUEUE_MOVE_ACK : "/user/queue/move-ack",
    TOPIC_POS : (roomId) => `/topic/room/${roomId}/pos`,
    TOPIC_MSG : (roomId) => `/topic/room/${roomId}/msg`,
    TOPIC_LEAVE : (roomId) => `/topic/room/${roomId}/leave`,
    TOPIC_CHAT : (roomId) => `/topic/room/${roomId}/chat`,
    TOPIC_NOTIFICATION : (roomId) => `/topic/room/${roomId}/notification`,
    TOPIC_EXPIRATION : (roomId) => `/topic/room/${roomId}/expiration`,

}

const ROOM = {
  BASE: "/room",
};

const USER = {
    MYINFO : "/member/info",
    ADDITIONAL_INFO : "/member/additional-info",
    CHANGE_CHARACTER : "/member/change",
    CHARACTER_INFO : "/member/me",
}

export default {AUTH, METAVERSE, WEBSOCKET, ROOM, USER};