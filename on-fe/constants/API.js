/**
 * 데이터 fetch, 서버로 데이터 전송 시 사용하는 API URI를 관리하는 js
 */

const AUTH = {
    SIGNUP: "/auth/signup",
    KAKAO_LOGIN : "/auth/login/kakao",
    NAVER_LOGIN : "/auth/login/naver",
    GITHUB_LOGIN : "/auth/login/github",
    GOOGLE_LOGIN : "/auth/login/google"
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

export default {AUTH, KAKAO_AUTH, METAVERSE, WEBSOCKET};