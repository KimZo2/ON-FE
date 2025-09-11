import { Events } from 'phaser';

/**
 * InputEventBus - Phaser에서 React로 사용자 입력을 전달하는 EventBus
 * 
 * 용도:
 * - Phaser에서 감지한 사용자 입력을 React로 전달
 * - React에서 서버 통신 처리
 * 
 * 이벤트 종류:
 * - input:playerMove: 플레이어 이동 입력 (Phaser → React)
 * - input:chatSend: 채팅 메시지 입력 (Phaser → React)
 * - input:keyDown: 키보드 입력 (Phaser → React) 
 * - input:click: 마우스 클릭 입력 (Phaser → React)
 */
class InputEventBusClass extends Events.EventEmitter {
    constructor() {
        super();
    }

    // Phaser → React 입력 이벤트들
    sendPlayerMove(moveData) {
        this.emit('input:playerMove', moveData);
    }

    sendChatMessage(chatData) {
        this.emit('input:chatSend', chatData);
    }

    sendKeyInput(keyData) {
        this.emit('input:keyDown', keyData);
    }

    sendClickInput(clickData) {
        this.emit('input:click', clickData);
    }

    // React에서 사용할 이벤트 리스너 등록 헬퍼들
    onPlayerMove(callback) {
        this.on('input:playerMove', callback);
    }

    onChatSend(callback) {
        this.on('input:chatSend', callback);
    }

    onKeyInput(callback) {
        this.on('input:keyDown', callback);
    }

    onClickInput(callback) {
        this.on('input:click', callback);
    }

    // 정리 메서드
    removeAllListeners() {
        super.removeAllListeners();
    }

    // 특정 이벤트 리스너만 제거
    offPlayerMove(callback) {
        this.off('input:playerMove', callback);
    }

    offChatSend(callback) {
        this.off('input:chatSend', callback);
    }
}

export const InputEventBus = new InputEventBusClass();