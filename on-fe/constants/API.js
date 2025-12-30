/**
 * 데이터 fetch, 서버로 데이터 전송 시 사용하는 API URI를 관리하는 js
 */

const AUTH = {
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    LOGIN: "/auth/login",
    // TODO: backend 로직 변경으로 인해 제거 필요 & 동작 확인 후 삭제
    // OAUTH_LOGIN: (provider) => `/oauth2/authorization/${provider}`,
};

const WEBSOCKET = {
    WS : "/ws"
}

const METAVERSE = {
    JOIN : (roomId) => `/app/room/${roomId}/join`,
    PING : (roomId) => `/app/room/${roomId}.ping`,
    MOVE : (roomId) => `/app/room/${roomId}.move`,
    SYNC : (roomId) => `/app/room/${roomId}.sync`,
}

const ROOM = {
  BASE: "/room",
};

const USER = {
    MYINFO : "/member/info",
    ADDITIONAL_INFO : "/member/additional-info",
}

export default {AUTH, METAVERSE, WEBSOCKET, ROOM};