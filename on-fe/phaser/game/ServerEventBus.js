import { Events } from 'phaser';

/**
 * ServerEventBus - 서버와 React 간의 통신을 담당하는 EventBus
 * 
 * 용도:
 * - 서버로 전송할 데이터 (React → Server)
 * - 서버에서 받은 데이터 (Server → React)
 * 
 * 이벤트 종류:
 * - server:playerMove: 플레이어 이동 데이터 서버 전송
 * - server:chatSend: 채팅 메시지 서버 전송
 * - server:playerJoined: 새 플레이어 입장 (서버 → React)
 * - server:playerLeft: 플레이어 퇴장 (서버 → React)
 * - server:onlineCount: 온라인 인원수 업데이트 (서버 → React)
 */
class ServerEventBusClass extends Events.EventEmitter {
    constructor() {
        super();
    }

    // 플레이어 이동 데이터 서버 전송 요청
    requestPlayerMove(moveData) {
        this.emit('server:playerMove', moveData);
    }

    // 채팅 메시지 서버 전송 요청
    requestChatSend(chatData) {
        this.emit('server:chatSend', chatData);
    }

    // 서버 응답 이벤트들
    onPlayerJoined(callback) {
        this.on('server:playerJoined', callback);
    }

    onPlayerLeft(callback) {
        this.on('server:playerLeft', callback);
    }

    onOnlineCountUpdate(callback) {
        this.on('server:onlineCount', callback);
    }

    onPlayerMoved(callback) {
        this.on('server:playerMoved', callback);
    }

    onPlayersSnapshot(callback) {
        this.on('server:playersSnapshot', callback);
    }

    // 정리 메서드
    removeAllListeners() {
        super.removeAllListeners();
    }
}

export const ServerEventBus = new ServerEventBusClass();