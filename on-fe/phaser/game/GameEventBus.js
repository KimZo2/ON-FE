import { Events } from 'phaser';

/**
 * GameEventBus - React와 Phaser 간의 게임 렌더링 통신을 담당하는 EventBus
 * 
 * 용도:
 * - React에서 Phaser로 게임 상태 업데이트 전달
 * - Phaser에서 React로 게임 이벤트 알림
 * 
 * 이벤트 종류:
 * - game:playerJoined: 새 플레이어 렌더링 요청 (React → Phaser)
 * - game:playerLeft: 플레이어 제거 요청 (React → Phaser)
 * - game:playerMoved: 다른 플레이어 이동 렌더링 (React → Phaser)
 * - game:playersSnapshot: 전체 플레이어 상태 업데이트 (React → Phaser)
 * - game:onlineCountUpdate: 온라인 수 UI 업데이트 (React → Phaser)
 * - game:chatReceived: 채팅 메시지 UI 표시 (React → Phaser)
 * - game:sceneReady: 게임 씬 준비 완료 알림 (Phaser → React)
 */
class GameEventBusClass extends Events.EventEmitter {
    constructor() {
        super();
    }

    // React → Phaser 이벤트들
    addPlayer(playerData) {
        this.emit('game:playerJoined', playerData);
    }

    removePlayer(userId) {
        this.emit('game:playerLeft', userId);
    }

    updatePlayer(playerData) {
        this.emit('game:playerMoved', playerData);
    }

    updateAllPlayers(playersData) {
        this.emit('game:playersSnapshot', playersData);
    }

    updateOnlineCount(count) {
        this.emit('game:onlineCountUpdate', count);
    }

    displayChatMessage(messageData) {
        this.emit('game:chatReceived', messageData);
    }

    // Phaser → React 이벤트들
    notifySceneReady(scene) {
        this.emit('game:sceneReady', scene);
    }

    // 이벤트 리스너 등록 헬퍼들
    onPlayerJoined(callback) {
        this.on('game:playerJoined', callback);
    }

    onPlayerLeft(callback) {
        this.on('game:playerLeft', callback);
    }

    onPlayerMoved(callback) {
        this.on('game:playerMoved', callback);
    }

    onPlayersSnapshot(callback) {
        this.on('game:playersSnapshot', callback);
    }

    onOnlineCountUpdate(callback) {
        this.on('game:onlineCountUpdate', callback);
    }

    onChatReceived(callback) {
        this.on('game:chatReceived', callback);
    }

    onSceneReady(callback) {
        this.on('game:sceneReady', callback);
    }

    // 정리 메서드
    removeAllListeners() {
        super.removeAllListeners();
    }
}

export const GameEventBus = new GameEventBusClass();