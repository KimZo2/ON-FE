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
        this.errorCallback = null;
        this.currentRoomId = null;
        this.joinStatus = null;
        this.sequenceNumber = 0;
        this.pingInterval = null;
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
            
            // 1. 먼저 개인 큐 구독 (/user/queue/join)
            await this.subscribeToPersonalQueue();

            this.isInitialized = true;
            return client;
        } catch (error) {
            this.isInitialized = false;
            throw error;
        }
    }

    async subscribeToPersonalQueue() {
        // 1. 개인 입장 응답 큐 구독
        this.connectionManager.subscribe('/user/queue/join', (response) => {
            this.handleJoinResponse(response);
        });
        
        // 2. 개인 위치 스냅샷 구독
        this.connectionManager.subscribe('/user/queue/pos-snapshot', (snapshot) => {
            if (EventBus && EventBus.emit) {
                EventBus.emit('players:snapshot', snapshot);
            } else {
                console.warn('EventBus not available for players:snapshot');
            }
        });
        
        // 3. 에러 큐 구독
        this.connectionManager.subscribe('/user/queue/errors', (errorData) => {
            this.handleError(errorData);
        });
    }

    // 에러 처리 메서드
    handleError(errorData) {
        const { code, message } = errorData;
        
        // 에러 콜백이 등록되어 있다면 호출
        if (this.errorCallback) {
            this.errorCallback({ code, message });
        }
        
        // MetaverseError 던지기 (상위 컴포넌트에서 처리)
        const error = new Error(message);
        error.code = code;
        error.name = 'MetaverseError';
        throw error;
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

    // 방 입장 요청
    async joinRoom(roomId, playerData, roomPassword = null) {
        try {
            this.currentRoomId = roomId;
            
            // localStorage에서 nickName 추출
            const nickname = this._getNickname();
            
            // RoomEnterDTO 형태로 데이터 전송
            const roomEnterDto = {
                nickname: nickname,
                password: roomPassword // private 방이면 비밀번호, public 방이면 null
            };
            
            this.connectionManager.publish(`/app/room/${roomId}/join`, roomEnterDto);
            this.playerManager.setCurrentPlayer(playerData.id, playerData);
        } catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    }

    // 방 입장 응답 처리
    handleJoinResponse(response) {
        this.joinStatus = response.status;
        
        switch (response.status) {
            case 'JOIN':
                console.log('🎉 방 입장 성공');
                this.setupRoomSubscriptions();
                this.startPingInterval();
                EventBus.emit('room:joined', response);
                break;
            case 'ALREADY':
                console.log('⚠️ 이미 방에 존재');
                this.setupRoomSubscriptions();
                EventBus.emit('room:already', response);
                break;
            case 'FULL':
                console.log('❌ 방이 꽉 참');
                EventBus.emit('room:full', response);
                break;
            case 'CLOSED_OR_NOT_FOUND':
                console.log('❌ 방을 찾을 수 없음');
                EventBus.emit('room:notfound', response);
                break;
            case 'ERROR':
                console.log('❌ 방 입장 에러');
                EventBus.emit('room:error', response);
                break;
            default:
                console.log('❓ 알 수 없는 응답:', response.status);
        }
    }

    // 방 입장 성공 후 추가 구독들 설정
    setupRoomSubscriptions() {
        if (!this.currentRoomId) return;

        // 방 브로드캐스트 구독
        this.connectionManager.subscribe(`/topic/room/${this.currentRoomId}/pos`, (data) => {
            EventBus.emit('player:moved', data);
        });

        // 개인 위치 스냅샷 구독
        this.connectionManager.subscribe('/user/queue/pos-snapshot', (snapshot) => {
            EventBus.emit('players:snapshot', snapshot);
        });

        // 이동 확인 구독 (선택적)
        this.connectionManager.subscribe('/user/queue/move-ack', (ack) => {
            EventBus.emit('move:ack', ack);
        });

        // 초기 동기화 요청
        this.requestSync();
    }

    // 동기화 요청
    requestSync() {
        if (!this.currentRoomId) return;
        
        this.connectionManager.publish(`/app/room/${this.currentRoomId}.sync`, {});
    }

    // 핑 간격 시작
    startPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }

        this.pingInterval = setInterval(() => {
            this.sendPing();
        }, 30000); // 30초마다 핑
    }

    // 핑 전송
    sendPing() {
        if (!this.currentRoomId) return;
        
        this.connectionManager.publish(`/app/room/${this.currentRoomId}.ping`, {});
    }

    // 플레이어 이동 전송 (시퀀스 번호 포함)
    sendPlayerMove(playerData) {
        if (!this.currentRoomId) {
            console.error('No current room to send move to');
            return;
        }

        try {
            this.sequenceNumber++;
            
            const moveData = {
                x: playerData.x,
                y: playerData.y,
                seq: this.sequenceNumber,
                direction: playerData.direction,
                isMoving: playerData.isMoving
            };

            this.connectionManager.publish(`/app/room/${this.currentRoomId}.move`, moveData);
            
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
            // 핑 인터벌 정리
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }

            this.clearUICallbacks();
            this.playerManager.clearAllPlayers();
            this.connectionManager.disconnect();
        } catch (error) {
            console.error('Error during disconnect:', error);
        } finally {
            this.isInitialized = false;
            this.currentRoomId = null;
            this.joinStatus = null;
            this.sequenceNumber = 0;
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

    setErrorCallback(callback) {
        this.errorCallback = callback;
    }

    // UI 콜백 해제 메서드
    clearUICallbacks() {
        this.onlineCountCallback = null;
        this.chatMessageCallback = null;
        this.errorCallback = null;
    }

    // localStorage 접근 헬퍼 메서드들
    _getAccessToken() {
        try {
            return localStorage.getItem('accessToken');
        } catch (error) {
            console.warn('Failed to get accessToken from localStorage:', error);
            return null;
        }
    }

    _getNickname() {
        try {
            return localStorage.getItem('nickName') || localStorage.getItem('nickname') || 'Anonymous';
        } catch (error) {
            console.warn('Failed to get nickname from localStorage:', error);
            return 'Anonymous';
        }
    }
}

const metaverseService = new MetaverseService();
export default metaverseService;