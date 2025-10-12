import { StompConnectionManager } from './connection/StompConnectionManager';
import { MetaverseEventManager } from './metaverse/MetaverseEventManager';
import { PlayerManager } from './metaverse/PlayerManager';
import { GameEventBus } from '../phaser/game/GameEventBus';

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
        this.initialSyncRequested = false;
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

            this.isInitialized = true;
            return client;
        } catch (error) {
            this.isInitialized = false;
            throw error;
        }
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

    // 방 입장 요청
    async joinRoom(roomId, playerData, roomPassword = null) {
        try {
            this.currentRoomId = roomId;
            this.initialSyncRequested = false;
            
            // localStorage에서 nickName 추출
            const nickname = this._getNickname();
            
            // RoomEnterDTO 형태로 데이터 전송
            const roomEnterDto = {
                nickname: nickname,
                password: roomPassword // private 방이면 비밀번호, public 방이면 null
            };
            
            this.connectionManager.publish(`/app/room/${roomId}/join`, roomEnterDto);
            this.playerManager.setCurrentPlayer(playerData.id, playerData);

            // 초기 구독 (/user/queue/join)
            this.setupRoomSubscriptions();
        } catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    }

    // 방 퇴장 요청
    leaveRoom(roomId = this.currentRoomId) {
        if (!roomId) {
            return;
        }

        if (!this.connectionManager || !this.connectionManager.isStompConnected()) {
            return;
        }

        try {
            this.connectionManager.publish(`/app/room/${roomId}/leave`, {});
        } catch (error) {
            console.error('Failed to leave room:', error);
        } finally {
            this.initialSyncRequested = false;
        }
    }

    // 방 입장 응답 처리
    handleJoinResponse(response) {
        const { roomId, message, count } = response;
        this.joinStatus = message;
        
        // 방 인원 수 업데이트 (성공한 경우에만)
        if (message === 'JOIN' || message === 'ALREADY') {
            if (this.onlineCountCallback && count !== undefined) {
                this.onlineCountCallback(count);
            }
        }
        
        switch (message) {
            case 'JOIN':
                this.setupRoomSubscriptions();
                this.startPingInterval();
                break;
            case 'ALREADY':
                this.setupRoomSubscriptions();
                this.startPingInterval();
                break;
            case 'FULL':
                this.currentRoomId = null;
                this.initialSyncRequested = false;
                if (typeof window !== 'undefined') {
                    alert('방이 가득찼습니다.');
                }
                // React는 useMetaverse에서 직접 처리하므로 GameEventBus 이벤트 불필요
                break;
            case 'CLOSED_OR_NOT_FOUND':
                this.currentRoomId = null;
                this.initialSyncRequested = false;
                if (typeof window !== 'undefined') {
                    alert('방이 종료되었거나 존재하지 않습니다.');
                }
                // React는 useMetaverse에서 직접 처리하므로 GameEventBus 이벤트 불필요
                break;
            case 'ERROR':
                this.currentRoomId = null;
                this.initialSyncRequested = false;
                if (typeof window !== 'undefined') {
                    alert('알 수 없는 에러가 발생하였습니다.');
                }
                // React는 useMetaverse에서 직접 처리하므로 GameEventBus 이벤트 불필요
                break;
            default:
                // 알 수 없는 응답
        }
    }

    // 방 입장 성공 후 추가 구독들 설정
    setupRoomSubscriptions() {
        if (!this.currentRoomId) return;

         // 개인 입장 응답 큐 구독
        this.connectionManager.subscribe('/user/queue/join', (response) => {
            this.handleJoinResponse(response);
        });

        // 개인 위치 스냅샷 구독
        this.connectionManager.subscribe('/user/queue/pos-snapshot', (snapshot) => {
            GameEventBus.updateAllPlayers(snapshot);
        });

        // 이동 확인 구독 (선택적) - 현재 GameEventBus에서는 처리하지 않음
        this.connectionManager.subscribe('/user/queue/move-ack', (ack) => {
            // 필요시 GameEventBus 이벤트 추가
        });

        // 방 브로드캐스트 구독
        this.connectionManager.subscribe(`/topic/room/${this.currentRoomId}/pos`, (data) => {
            // updates 배열이 있으면 snapshot 데이터로 처리
            if (data.updates && Array.isArray(data.updates)) {
                GameEventBus.updateAllPlayers(data);
            } else {
                // 개별 플레이어 데이터로 처리
                GameEventBus.updatePlayer(data);
            }
        });

        // 방 메시지 구독 (새 플레이어 입장/퇴장 알림)
        this.connectionManager.subscribe(`/topic/room/${this.currentRoomId}/msg`, (messageData) => {
            this.handleRoomMessage(messageData);
        });
    }

    // 방 메시지 처리 (새 사용자 입장 알림)
    handleRoomMessage(messageData) {
        const { roomId, message, count } = messageData;

        // JOIN인 경우에만 새로운 사용자가 입장했다는 의미
        if (message === 'JOIN' || message === 'ALREADY') {
            // 현재 방 인원 수 업데이트
            if (this.onlineCountCallback && count !== undefined) {
                this.onlineCountCallback(count);
            }

            // GameEventBus로 온라인 수 업데이트 전달 (Phaser 화면 업데이트용)
            if (GameEventBus && GameEventBus.updateOnlineCount) {
                GameEventBus.updateOnlineCount(count);
            }

            // 동기화 요청하여 새로운 플레이어 정보 가져오기
            this.requestSync();
        }
    }

    // 내부용 동기화 요청
    requestSync() {
        if (!this.currentRoomId) return;

        this.connectionManager.publish(`/app/room/${this.currentRoomId}/sync`, {});
    }

    // Scene 준비 완료 시 초기 위치 전송 및 동기화
    handleSceneReady(scene) {
        if (!this.currentRoomId || !this.connectionManager?.isStompConnected?.()) {
            return;
        }

        const shouldSendInitialPosition = !this.initialSyncRequested;
        const userId = scene?.userId || this.playerManager.getCurrentPlayer()?.userId;
        const playerSprite = scene?.currentPlayer;

        if (shouldSendInitialPosition && userId && playerSprite) {
            try {
                this.sendPlayerMove({
                    userId,
                    x: playerSprite.x,
                    y: playerSprite.y,
                    direction: playerSprite.lastDirection || 'down',
                    isMoving: false
                });
            } catch (error) {
                console.error('Failed to send initial player position:', error);
            }
        }

        this.requestSync(); // 동기화 요청 보내기

        if (shouldSendInitialPosition) {
            this.initialSyncRequested = true;
        }
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
        
        this.connectionManager.publish(`/app/room/${this.currentRoomId}/ping`, {});
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

            this.connectionManager.publish(`/app/room/${this.currentRoomId}/move`, moveData);
            
            this.playerManager.updatePlayerPosition(playerData.userId, 
                { x: playerData.x, y: playerData.y }, 
                playerData.direction
            );
        } catch (error) {
            console.error('Failed to send player move:', error);
            throw error;
        }
    }

    // 플레이어 퇴장 전송
    sendPlayerLeft(userId) {
        try {
            this.connectionManager.publish('/app/playerLeft', userId);
            this.playerManager.removePlayer(userId);
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
            const activeRoomId = this.currentRoomId;

            if (activeRoomId) {
                this.leaveRoom(activeRoomId);
            }

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
            this.initialSyncRequested = false;
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
            return localStorage.getItem('nickName') || 'Anonymous';
        } catch (error) {
            console.warn('Failed to get nickname from localStorage:', error);
            return 'Anonymous';
        }
    }
}

const metaverseService = new MetaverseService();
export default metaverseService;
