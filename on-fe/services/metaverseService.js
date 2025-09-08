import { StompConnectionManager } from './connection/StompConnectionManager';
import { MetaverseEventManager } from './metaverse/MetaverseEventManager';
import { PlayerManager } from './metaverse/PlayerManager';
import { EventBus } from '../phaser/game/EventBus';
import API from '@/constants/API';

class MetaverseService {
    constructor() {
        this.isInitialized = false;
        this.connectionManager = new StompConnectionManager();
        this.eventManager = new MetaverseEventManager(this.connectionManager);
        this.playerManager = new PlayerManager(this.eventManager);
        this.onlineCountCallback = null;
        this.chatMessageCallback = null;
    }

    async initialize() {
        if (this.isInitialized) {
            return this.connectionManager.getClient();
        }
        
        try {
            const client = await this.connectionManager.connect();
            if (!client) {
                throw new Error('STOMP 연결에 실패했습니다.');
            }

            // 이벤트 핸들러 먼저 설정
            this.setupEventHandlers();
            
            // 그 다음 이벤트 매핑 설정 (실제 구독 생성)
            this.eventManager.setupEventMappings();

            this.isInitialized = true;
            return client;
        } catch (error) {
            this.isInitialized = false;
            throw error;
        }
    }

    setupEventHandlers() {
        // EventBus를 통한 이벤트 처리
        
        // 온라인 카운트 처리
        EventBus.on('online:count', (count) => {
            if (this.onlineCountCallback) {
                this.onlineCountCallback(count);
            }
        });

        // 채팅 메시지 처리
        EventBus.on('chat:message', (messageData) => {
            if (this.chatMessageCallback) {
                this.chatMessageCallback(messageData);
            }
        });
    }

    // 플레이어 참가 전송
    sendPlayerJoined(roomId, playerData) {
        try {
            this.connectionManager.publish(API.METAVERSE.JOIN(roomId), playerData);
            this.playerManager.setCurrentPlayer(playerData.id, playerData);
        } catch (error) {
            console.error('Failed to send player joined:', error);
            throw error;
        }
    }

    // 플레이어 이동 전송
    sendPlayerMove(roomId, playerData) {
        try {
            this.connectionManager.publish(API.METAVERSE.MOVE(roomId), playerData);
            this.playerManager.updatePlayerPosition(playerData.id, 
                { x: playerData.x, y: playerData.y }, 
                playerData.direction
            );
        } catch (error) {
            console.error('Failed to send player move:', error);
            throw error;
        }
    }

    // 플레이어 퇴장 전송
    sendPlayerLeft(playerId) {
        try {
            this.connectionManager.publish('/app/playerLeft', playerId);
            this.playerManager.removePlayer(playerId);
        } catch (error) {
            console.error('Failed to send player left:', error);
            throw error;
        }
    }

    // 채팅 메시지 전송
    sendChatMessage(messageData) {
        try {
            this.connectionManager.publish('/app/chatMessage', messageData);
        } catch (error) {
            console.error('Failed to send chat message:', error);
            throw error;
        }
    }

    // 연결 해제
    disconnect() {
        try {
            this.clearUICallbacks();
            this.playerManager.clearAllPlayers();
            this.connectionManager.disconnect();
        } catch (error) {
            console.error('Error during disconnect:', error);
        } finally {
            this.isInitialized = false;
        }
    }

    // 연결 상태 확인
    isConnected() {
        return this.connectionManager.isStompConnected();
    }

    // STOMP 클라이언트 반환 (Phaser에서 직접 사용하기 위해)
    getClient() {
        return this.connectionManager.getClient();
    }

    // Player Manager 접근자
    getPlayerManager() {
        return this.playerManager;
    }

    // Connection Manager 접근자
    getConnectionManager() {
        return this.connectionManager;
    }

    // Event Manager 접근자  
    getEventManager() {
        return this.eventManager;
    }

    // 연결 상태 정보
    getConnectionStatus() {
        return this.connectionManager.getConnectionStatus();
    }

    // UI 콜백 등록 메서드
    setOnlineCountCallback(callback) {
        this.onlineCountCallback = callback;
    }

    setChatMessageCallback(callback) {
        this.chatMessageCallback = callback;
    }

    // UI 콜백 해제 메서드
    clearUICallbacks() {
        this.onlineCountCallback = null;
        this.chatMessageCallback = null;
    }
}

const metaverseService = new MetaverseService();
export default metaverseService;